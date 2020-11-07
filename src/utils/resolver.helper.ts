export const withCancel = (asyncIterator: any, onCancel: any) => {
  const savedReturn: any = asyncIterator.return;

  asyncIterator.return = async () => {
    await onCancel();
    return savedReturn ? savedReturn.call(asyncIterator) : Promise.resolve({ value: undefined, done: true });
  };

  return asyncIterator;
};
