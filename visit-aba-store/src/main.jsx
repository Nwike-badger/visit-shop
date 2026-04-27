import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

/**
 * QueryClient is configured once at the app root.
 *
 * staleTime:  5 minutes  — search results stay fresh without refetching on
 *                          every navigation back to a results page.
 * retry:      1          — one retry on network error; don't hammer the
 *                          server on genuine 4xx errors.
 * refetchOnWindowFocus: false — prevents a background refetch every time
 *                          the user alt-tabs back to the browser tab.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);