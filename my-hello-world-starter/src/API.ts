/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type TodoInput = {
  title?: string | null,
  desc?: string | null,
};

export type Event = {
  __typename: "Event",
  result?: string | null,
};

export type Todo = {
  __typename: "Todo",
  title?: string | null,
  desc?: string | null,
};

export type AddTodoMutationVariables = {
  todo?: TodoInput | null,
};

export type AddTodoMutation = {
  addTodo?:  {
    __typename: "Event",
    result?: string | null,
  } | null,
};

export type DeleteTodoMutationVariables = {
  id?: string | null,
};

export type DeleteTodoMutation = {
  deleteTodo?:  {
    __typename: "Event",
    result?: string | null,
  } | null,
};

export type GetTodoQuery = {
  getTodo?:  Array< {
    __typename: "Todo",
    title?: string | null,
    desc?: string | null,
  } | null > | null,
};
