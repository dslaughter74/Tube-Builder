/* tslint:disable */
import App from '@/App';
import {DataContext} from '@/context';
import { Example } from '@/lib/types';
import React from 'react';
import ReactDOM from 'react-dom/client';

function DataProvider({children}: { children: React.ReactNode }) {
  const [examples, setExamples] = React.useState<Example[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    fetch('data/examples.json')
      .then(res => res.json())
      .then((d: Example[]) => {
        setExamples(d);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load examples.json:", err);
        setIsLoading(false);
      });
  }, []);
  return <DataContext.Provider value={{ examples, isLoading, setExamples, defaultExample: examples[0] || null }}>{children}</DataContext.Provider>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<DataProvider><App /></DataProvider>);