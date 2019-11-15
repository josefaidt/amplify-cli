import { DeletionPolicy } from 'cloudform-types';
import {
  DirectiveNode,
  ObjectTypeDefinitionNode,
  InterfaceTypeDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
} from 'graphql';
import {
  blankObject,
  makeConnectionField,
  makeField,
  makeInputValueDefinition,
  makeNamedType,
  makeNonNullType,
  ModelResourceIDs,
  ResolverResourceIDs,
  getDirectiveArgument,
} from 'graphql-transformer-common';
import { getDirectiveArguments, gql, Transformer, TransformerContext } from 'graphql-transformer-core';
import {
  getNonModelObjectArray,
  makeCreateInputObject,
  makeDeleteInputObject,
  makeEnumFilterInputObjects,
  makeModelConnectionType,
  makeModelSortDirectionEnumObject,
  makeModelXFilterInputObject,
  makeNonModelInputObject,
  makeScalarFilterInputs,
  makeSubscriptionField,
  makeUpdateInputObject,
  makeModelXConditionInputObject,
} from './definitions';
import { ModelDirectiveArgs } from './ModelDirectiveArgs';
import { ResourceFactory } from './resources';

export interface DynamoDBModelTransformerOptions {
  EnableDeletionProtection?: boolean;
}

/**
 * The @model transformer.
 *
 * This transform creates a single DynamoDB table for all of your application's
 * data. It uses a standard key structure and nested map to store object values.
 * A relationKey field
 *
 * {
 *  type (HASH),
 *  id (SORT),
 *  value (MAP),
 *  createdAt, (LSI w/ type)
 *  updatedAt (LSI w/ type)
 * }
 */

export class DynamoDBModelTransformer extends Transformer {
  resources: ResourceFactory;
  opts: DynamoDBModelTransformerOptions;

  constructor(opts: DynamoDBModelTransformerOptions = {}) {
    super(
      'DynamoDBModelTransformer',
      gql`
        directive @model(queries: ModelQueryMap, mutations: ModelMutationMap, subscriptions: ModelSubscriptionMap) on OBJECT
        input ModelMutationMap {
          create: String
          update: String
          delete: String
        }
        input ModelQueryMap {
          get: String
          list: String
        }
        input ModelSubscriptionMap {
          onCreate: [String]
          onUpdate: [String]
          onDelete: [String]
          level: ModelSubscriptionLevel
        }
        enum ModelSubscriptionLevel {
          off
          public
          on
        }
      `
    );
    this.opts = this.getOpts(opts);
    this.resources = new ResourceFactory();
  }

  public before = (ctx: TransformerContext): void => {
    const template = this.resources.initTemplate();
    ctx.mergeResources(template.Resources);
    ctx.mergeParameters(template.Parameters);
    ctx.mergeOutputs(template.Outputs);
    ctx.mergeConditions(template.Conditions);
  };

  /**
   * Given the initial input and context manipulate the context to handle this object directive.
   * @param initial The input passed to the transform.
   * @param ctx The accumulated context for the transform.
   */
  public object = (def: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext): void => {
    // Add a stack mapping so that all model resources are pulled
    // into their own stack at the end of the transformation.
    const stackName = def.name.value;

    const nonModelArray: ObjectTypeDefinitionNode[] = getNonModelObjectArray(def, ctx, new Map<string, ObjectTypeDefinitionNode>());

    nonModelArray.forEach((value: ObjectTypeDefinitionNode) => {
      const nonModelObject = makeNonModelInputObject(value, nonModelArray, ctx);
      if (!this.typeExist(nonModelObject.name.value, ctx)) {
        ctx.addInput(nonModelObject);
      }
    });

    // Create the dynamodb table to hold the @model type
    // TODO: Handle types with more than a single "id" hash key
    const typeName = def.name.value;
    const tableLogicalID = ModelResourceIDs.ModelTableResourceID(typeName);
    const iamRoleLogicalID = ModelResourceIDs.ModelTableIAMRoleID(typeName);
    const dataSourceRoleLogicalID = ModelResourceIDs.ModelTableDataSourceID(typeName);
    const deletionPolicy = this.opts.EnableDeletionProtection ? DeletionPolicy.Retain : DeletionPolicy.Delete;
    ctx.setResource(tableLogicalID, this.resources.makeModelTable(typeName, undefined, undefined, deletionPolicy));
    ctx.mapResourceToStack(stackName, tableLogicalID);

    ctx.setResource(iamRoleLogicalID, this.resources.makeIAMRole(typeName));
    ctx.mapResourceToStack(stackName, iamRoleLogicalID);

    ctx.setResource(dataSourceRoleLogicalID, this.resources.makeDynamoDBDataSource(tableLogicalID, iamRoleLogicalID, typeName));
    ctx.mapResourceToStack(stackName, dataSourceRoleLogicalID);

    const streamArnOutputId = `GetAtt${ModelResourceIDs.ModelTableStreamArn(typeName)}`;
    ctx.setOutput(
      // "GetAtt" is a backward compatibility addition to prevent breaking current deploys.
      streamArnOutputId,
      this.resources.makeTableStreamArnOutput(tableLogicalID)
    );
    ctx.mapResourceToStack(stackName, streamArnOutputId);

    const datasourceOutputId = `GetAtt${dataSourceRoleLogicalID}Name`;
    ctx.setOutput(datasourceOutputId, this.resources.makeDataSourceOutput(dataSourceRoleLogicalID));
    ctx.mapResourceToStack(stackName, datasourceOutputId);

    const tableNameOutputId = `GetAtt${tableLogicalID}Name`;
    ctx.setOutput(tableNameOutputId, this.resources.makeTableNameOutput(tableLogicalID));
    ctx.mapResourceToStack(stackName, tableNameOutputId);

    this.createQueries(def, directive, ctx);
    this.createMutations(def, directive, ctx, nonModelArray);
    this.createSubscriptions(def, directive, ctx);

    // Update ModelXConditionInput type
    this.updateMutationConditionInput(ctx, def);
  };

  private createMutations = (
    def: ObjectTypeDefinitionNode,
    directive: DirectiveNode,
    ctx: TransformerContext,
    nonModelArray: ObjectTypeDefinitionNode[]
  ) => {
    const typeName = def.name.value;

    const mutationFields = [];
    // Get any name overrides provided by the user. If an empty map it provided
    // then we do not generate those fields.
    const directiveArguments: ModelDirectiveArgs = getDirectiveArguments(directive);

    // Configure mutations based on *mutations* argument
    let shouldMakeCreate = true;
    let shouldMakeUpdate = true;
    let shouldMakeDelete = true;
    let createFieldNameOverride = undefined;
    let updateFieldNameOverride = undefined;
    let deleteFieldNameOverride = undefined;

    // Figure out which mutations to make and if they have name overrides
    if (directiveArguments.mutations === null) {
      shouldMakeCreate = false;
      shouldMakeUpdate = false;
      shouldMakeDelete = false;
    } else if (directiveArguments.mutations) {
      if (!directiveArguments.mutations.create) {
        shouldMakeCreate = false;
      } else {
        createFieldNameOverride = directiveArguments.mutations.create;
      }
      if (!directiveArguments.mutations.update) {
        shouldMakeUpdate = false;
      } else {
        updateFieldNameOverride = directiveArguments.mutations.update;
      }
      if (!directiveArguments.mutations.delete) {
        shouldMakeDelete = false;
      } else {
        deleteFieldNameOverride = directiveArguments.mutations.delete;
      }
    }

    const conditionInputName = ModelResourceIDs.ModelConditionInputTypeName(typeName);

    // Create the mutations.
    if (shouldMakeCreate) {
      const createInput = makeCreateInputObject(def, nonModelArray, ctx);
      if (!ctx.getType(createInput.name.value)) {
        ctx.addInput(createInput);
      }
      const createResolver = this.resources.makeCreateResolver(def.name.value, createFieldNameOverride);
      const resourceId = ResolverResourceIDs.DynamoDBCreateResolverResourceID(typeName);
      ctx.setResource(resourceId, createResolver);
      ctx.mapResourceToStack(typeName, resourceId);
      mutationFields.push(
        makeField(
          createResolver.Properties.FieldName,
          [
            makeInputValueDefinition('input', makeNonNullType(makeNamedType(createInput.name.value))),
            makeInputValueDefinition('condition', makeNamedType(conditionInputName)),
          ],
          makeNamedType(def.name.value)
        )
      );
    }

    if (shouldMakeUpdate) {
      const updateInput = makeUpdateInputObject(def, nonModelArray, ctx);
      if (!ctx.getType(updateInput.name.value)) {
        ctx.addInput(updateInput);
      }
      const updateResolver = this.resources.makeUpdateResolver(def.name.value, updateFieldNameOverride);
      const resourceId = ResolverResourceIDs.DynamoDBUpdateResolverResourceID(typeName);
      ctx.setResource(resourceId, updateResolver);
      ctx.mapResourceToStack(typeName, resourceId);
      mutationFields.push(
        makeField(
          updateResolver.Properties.FieldName,
          [
            makeInputValueDefinition('input', makeNonNullType(makeNamedType(updateInput.name.value))),
            makeInputValueDefinition('condition', makeNamedType(conditionInputName)),
          ],
          makeNamedType(def.name.value)
        )
      );
    }

    if (shouldMakeDelete) {
      const deleteInput = makeDeleteInputObject(def);
      if (!ctx.getType(deleteInput.name.value)) {
        ctx.addInput(deleteInput);
      }
      const deleteResolver = this.resources.makeDeleteResolver(def.name.value, deleteFieldNameOverride);
      const resourceId = ResolverResourceIDs.DynamoDBDeleteResolverResourceID(typeName);
      ctx.setResource(resourceId, deleteResolver);
      ctx.mapResourceToStack(typeName, resourceId);
      mutationFields.push(
        makeField(
          deleteResolver.Properties.FieldName,
          [
            makeInputValueDefinition('input', makeNonNullType(makeNamedType(deleteInput.name.value))),
            makeInputValueDefinition('condition', makeNamedType(conditionInputName)),
          ],
          makeNamedType(def.name.value)
        )
      );
    }
    ctx.addMutationFields(mutationFields);

    if (shouldMakeCreate || shouldMakeUpdate || shouldMakeDelete) {
      this.generateConditionInputs(ctx, def);
    }
  };

  private createQueries = (def: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => {
    const typeName = def.name.value;
    const queryFields = [];
    const directiveArguments: ModelDirectiveArgs = getDirectiveArguments(directive);

    // Configure queries based on *queries* argument
    let shouldMakeGet = true;
    let shouldMakeList = true;
    let getFieldNameOverride = undefined;
    let listFieldNameOverride = undefined;

    // Figure out which queries to make and if they have name overrides.
    // If queries is undefined (default), create all queries
    // If queries is explicetly set to null, do not create any
    // else if queries is defined, check overrides
    if (directiveArguments.queries === null) {
      shouldMakeGet = false;
      shouldMakeList = false;
    } else if (directiveArguments.queries) {
      if (!directiveArguments.queries.get) {
        shouldMakeGet = false;
      } else {
        getFieldNameOverride = directiveArguments.queries.get;
      }
      if (!directiveArguments.queries.list) {
        shouldMakeList = false;
      } else {
        listFieldNameOverride = directiveArguments.queries.list;
      }
    }

    if (shouldMakeList) {
      if (!this.typeExist('ModelSortDirection', ctx)) {
        const tableSortDirection = makeModelSortDirectionEnumObject();
        ctx.addEnum(tableSortDirection);
      }
    }

    // Create get queries
    if (shouldMakeGet) {
      const getResolver = this.resources.makeGetResolver(def.name.value, getFieldNameOverride, ctx.getQueryTypeName());
      const resourceId = ResolverResourceIDs.DynamoDBGetResolverResourceID(typeName);
      ctx.setResource(resourceId, getResolver);
      ctx.mapResourceToStack(typeName, resourceId);

      queryFields.push(
        makeField(
          getResolver.Properties.FieldName,
          [makeInputValueDefinition('id', makeNonNullType(makeNamedType('ID')))],
          makeNamedType(def.name.value)
        )
      );
    }

    if (shouldMakeList) {
      this.generateModelXConnectionType(ctx, def);

      // Create the list resolver
      const listResolver = this.resources.makeListResolver(def.name.value, listFieldNameOverride, ctx.getQueryTypeName());
      const resourceId = ResolverResourceIDs.DynamoDBListResolverResourceID(typeName);
      ctx.setResource(resourceId, listResolver);
      ctx.mapResourceToStack(typeName, resourceId);

      queryFields.push(makeConnectionField(listResolver.Properties.FieldName, def.name.value));
    }
    this.generateFilterInputs(ctx, def);

    ctx.addQueryFields(queryFields);
  };

  /**
   * Creates subscriptions for a @model object type. By default creates a subscription for
   * create, update, and delete mutations.
   *
   * Subscriptions are one to many in that a subscription may subscribe to multiple mutations.
   * You may thus provide multiple names of the subscriptions that will be triggered by each
   * mutation.
   *
   * type Post @model(subscriptions: { onCreate: ["onPostCreated", "onFeedUpdated"] }) {
   *      id: ID!
   *      title: String!
   * }
   *
   * will create two subscription fields:
   *
   * type Subscription {
   *      onPostCreated: Post @aws_subscribe(mutations: ["createPost"])
   *      onFeedUpdated: Post @aws_subscribe(mutations: ["createPost"])
   * }
   *  Subscription Levels
   *   subscriptions.level === OFF || subscriptions === null
   *      Will not create subscription operations
   *   subcriptions.level === PUBLIC
   *      Will continue as is creating subscription operations
   *   subscriptions.level === ON || subscriptions === undefined
   *      If auth is enabled it will enabled protection on subscription operations and resolvers
   */
  private createSubscriptions = (def: ObjectTypeDefinitionNode, directive: DirectiveNode, ctx: TransformerContext) => {
    const typeName = def.name.value;
    const subscriptionFields = [];

    const directiveArguments: ModelDirectiveArgs = getDirectiveArguments(directive);

    const subscriptionsArgument = directiveArguments.subscriptions;
    const createResolver = ctx.getResource(ResolverResourceIDs.DynamoDBCreateResolverResourceID(typeName));
    const updateResolver = ctx.getResource(ResolverResourceIDs.DynamoDBUpdateResolverResourceID(typeName));
    const deleteResolver = ctx.getResource(ResolverResourceIDs.DynamoDBDeleteResolverResourceID(typeName));

    if (subscriptionsArgument === null) {
      return;
    }
    if (subscriptionsArgument && subscriptionsArgument.level === 'off') {
      return;
    }
    if (subscriptionsArgument && (subscriptionsArgument.onCreate || subscriptionsArgument.onUpdate || subscriptionsArgument.onDelete)) {
      // Add the custom subscriptions
      const subscriptionToMutationsMap: { [subField: string]: string[] } = {};
      const onCreate = subscriptionsArgument.onCreate || [];
      const onUpdate = subscriptionsArgument.onUpdate || [];
      const onDelete = subscriptionsArgument.onDelete || [];
      const subFields = [...onCreate, ...onUpdate, ...onDelete];
      // initialize the reverse lookup
      for (const field of subFields) {
        subscriptionToMutationsMap[field] = [];
      }
      // Add the correct mutation to the lookup
      for (const field of Object.keys(subscriptionToMutationsMap)) {
        if (onCreate.includes(field) && createResolver) {
          subscriptionToMutationsMap[field].push(createResolver.Properties.FieldName);
        }
        if (onUpdate.includes(field) && updateResolver) {
          subscriptionToMutationsMap[field].push(updateResolver.Properties.FieldName);
        }
        if (onDelete.includes(field) && deleteResolver) {
          subscriptionToMutationsMap[field].push(deleteResolver.Properties.FieldName);
        }
      }
      for (const subFieldName of Object.keys(subscriptionToMutationsMap)) {
        const subField = makeSubscriptionField(subFieldName, typeName, subscriptionToMutationsMap[subFieldName]);
        subscriptionFields.push(subField);
      }
    } else {
      // Add the default subscriptions
      if (createResolver) {
        const onCreateField = makeSubscriptionField(ModelResourceIDs.ModelOnCreateSubscriptionName(typeName), typeName, [
          createResolver.Properties.FieldName,
        ]);
        subscriptionFields.push(onCreateField);
      }
      if (updateResolver) {
        const onUpdateField = makeSubscriptionField(ModelResourceIDs.ModelOnUpdateSubscriptionName(typeName), typeName, [
          updateResolver.Properties.FieldName,
        ]);
        subscriptionFields.push(onUpdateField);
      }
      if (deleteResolver) {
        const onDeleteField = makeSubscriptionField(ModelResourceIDs.ModelOnDeleteSubscriptionName(typeName), typeName, [
          deleteResolver.Properties.FieldName,
        ]);
        subscriptionFields.push(onDeleteField);
      }
    }

    ctx.addSubscriptionFields(subscriptionFields);
  };

  private typeExist(type: string, ctx: TransformerContext): boolean {
    return Boolean(type in ctx.nodeMap);
  }

  private generateModelXConnectionType(ctx: TransformerContext, def: ObjectTypeDefinitionNode): void {
    const tableXConnectionName = ModelResourceIDs.ModelConnectionTypeName(def.name.value);
    if (this.typeExist(tableXConnectionName, ctx)) {
      return;
    }

    // Create the ModelXConnection
    const connectionType = blankObject(tableXConnectionName);
    ctx.addObject(connectionType);

    ctx.addObjectExtension(makeModelConnectionType(def.name.value));
  }

  private generateFilterInputs(ctx: TransformerContext, def: ObjectTypeDefinitionNode): void {
    const scalarFilters = makeScalarFilterInputs();
    for (const filter of scalarFilters) {
      if (!this.typeExist(filter.name.value, ctx)) {
        ctx.addInput(filter);
      }
    }

    // Create the Enum filters
    const enumFilters = makeEnumFilterInputObjects(def, ctx);
    for (const filter of enumFilters) {
      if (!this.typeExist(filter.name.value, ctx)) {
        ctx.addInput(filter);
      }
    }

    // Create the ModelXFilterInput
    const tableXQueryFilterInput = makeModelXFilterInputObject(def, ctx);
    if (!this.typeExist(tableXQueryFilterInput.name.value, ctx)) {
      ctx.addInput(tableXQueryFilterInput);
    }
  }

  private generateConditionInputs(ctx: TransformerContext, def: ObjectTypeDefinitionNode): void {
    const scalarFilters = makeScalarFilterInputs();
    for (const filter of scalarFilters) {
      if (!this.typeExist(filter.name.value, ctx)) {
        ctx.addInput(filter);
      }
    }

    // Create the Enum filters
    const enumFilters = makeEnumFilterInputObjects(def, ctx);
    for (const filter of enumFilters) {
      if (!this.typeExist(filter.name.value, ctx)) {
        ctx.addInput(filter);
      }
    }

    // Create the ModelXConditionInput
    const tableXMutationConditionInput = makeModelXConditionInputObject(def, ctx);
    if (!this.typeExist(tableXMutationConditionInput.name.value, ctx)) {
      ctx.addInput(tableXMutationConditionInput);
    }
  }

  private getOpts(opts: DynamoDBModelTransformerOptions) {
    const defaultOpts = {
      EnableDeletionProtection: false,
    };
    return {
      ...defaultOpts,
      ...opts,
    };
  }

  // Due to the current architecture of Transformers we've to handle the 'id' field removal
  // here, because KeyTranformer will not be invoked if there are no @key directives declared
  // on the type.
  private updateMutationConditionInput(ctx: TransformerContext, type: ObjectTypeDefinitionNode): void {
    // Get the existing ModelXConditionInput
    const tableXMutationConditionInputName = ModelResourceIDs.ModelConditionInputTypeName(type.name.value);

    if (this.typeExist(tableXMutationConditionInputName, ctx)) {
      const tableXMutationConditionInput = <InputObjectTypeDefinitionNode>ctx.getType(tableXMutationConditionInputName);

      const keyDirectives = type.directives.filter(d => d.name.value === 'key');

      // If there are @key directives defined we've nothing to do, it will handle everything
      if (keyDirectives && keyDirectives.length > 0) {
        return;
      }

      // Remove the field named 'id' from the condition if there is one
      const idField = tableXMutationConditionInput.fields.find(f => f.name.value === 'id');

      if (idField) {
        const reducedFields = tableXMutationConditionInput.fields.filter(f => Boolean(f.name.value !== 'id'));

        const updatedInput = {
          ...tableXMutationConditionInput,
          fields: reducedFields,
        };

        ctx.putType(updatedInput);
      }
    }
  }
}
