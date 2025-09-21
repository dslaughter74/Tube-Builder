/* tslint:disable */
export const parseJSON=(str:string)=>JSON.parse(str.substring(str.indexOf('{'),str.lastIndexOf('}')+1));
export const parseHTML=(str:string,opener:string,closer:string)=>str.substring(str.indexOf('<!DOCTYPE html>'),str.lastIndexOf(closer));
