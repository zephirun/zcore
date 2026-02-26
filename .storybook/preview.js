import '../src/index.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { DataProvider } from '../src/context/DataContext.jsx';
import { ToastProvider } from '../src/context/ToastContext.jsx';
import { queryClient } from '../src/lib/react-query.js';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo"
    },
    options: {
      storySort: {
        order: ['Foundations', 'UI Base', 'Data Components', 'Layout'],
      },
    },
    chromatic: {
      disableAnimations: true,
      modes: {
        'light default': { theme: 'light', density: 'default' },
        'dark default': { theme: 'dark', density: 'default' },
        'light compact': { theme: 'light', density: 'compact' },
        'dark compact': { theme: 'dark', density: 'compact' },
        'light comfortable': { theme: 'light', density: 'comfortable' },
        'dark comfortable': { theme: 'dark', density: 'comfortable' },
      },
    },
  },
  globalTypes: {
    density: {
      name: 'Density',
      description: 'Z.CORE Data Density Profile',
      defaultValue: 'default',
      toolbar: {
        icon: 'zoom',
        items: ['compact', 'default', 'comfortable'],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

const withBackgroundAndRouter = (Story, context) => {
  const density = context.globals.density;
  document.documentElement.setAttribute('data-density', density);

  return React.createElement(
    'div',
    {
      style: {
        padding: '32px',
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }
    },
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        DataProvider,
        null,
        React.createElement(
          ToastProvider,
          null,
          React.createElement(
            BrowserRouter,
            null,
            React.createElement(Story, null)
          )
        )
      )
    )
  );
};

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
  withBackgroundAndRouter
];

export default preview;