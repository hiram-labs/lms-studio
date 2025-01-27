type TTableDataFuncParam = TApiReqCookie & {
  tableCurrentPage: number;
  tablePaginationSize: number;
  rest: Record<string, unknown>;
};
