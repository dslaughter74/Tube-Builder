/* tslint:disable */
import {Example} from '@/lib/types';
import {type Dispatch, type SetStateAction, createContext} from 'react';

export interface Data {
  examples: Example[];
  setExamples: Dispatch<SetStateAction<Example[]>>;
  defaultExample: Example | null;
  isLoading: boolean;
}

export const DataContext = createContext<Data>({
  examples: [],
  setExamples: () => {},
  defaultExample: null,
  isLoading: true,
});