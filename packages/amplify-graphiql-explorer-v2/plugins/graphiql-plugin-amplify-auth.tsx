'use client';
import { useRef } from 'react';
import { GraphiQLPlugin } from '@graphiql/react';
import { AmplifyAuthPlugin } from './AmplifyAuthPlugin';
import type { AmplifyAuthPluginProps } from './AmplifyAuthPlugin';

export function useAmplifyAuthPlugin(props?: AmplifyAuthPluginProps) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const pluginRef = useRef<GraphiQLPlugin>();
  pluginRef.current ||= {
    title: 'Amplify Auth',
    icon: () => (
      <svg width="126px" height="94px" viewBox="0 0 126 94" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <title>Logo/Amplify Logo White</title>
        <desc>Created with Sketch.</desc>
        <defs></defs>
        <g id="Logo/Amplify-Logo-White" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="Group" fill="currentColor">
            <path
              d="M27.4193646,78 L62.9093796,78 L72,94 L71.743892,94 L0,94 L25.2808604,50.192137 L35.8751825,31.8473288 L44.9710103,47.6084247 L27.4193646,78 Z M40.6554116,23.5512493 L49.3887526,8.41853699 L98.814466,93.9997425 L81.3108879,93.9997425 L40.6554116,23.5512493 Z M54.249635,0 L71.7299104,0 L126,94 L108.497716,94 L54.249635,0 Z"
              id="Fill-1"
            ></path>
          </g>
        </g>
      </svg>
    ),
    content: () => <AmplifyAuthPlugin {...propsRef.current} />,
  };
  return pluginRef.current;
}
