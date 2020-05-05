import * as React from "react";
import { renderHook } from "@testing-library/react-hooks";
import { useQuery } from "react-apollo";
import { MockedProvider } from "@apollo/react-testing";
import gql from "graphql-tag";

const NumQuery = gql`
  query O365OnedriveList($num: Int!) {
    add5(num: $num) {
      result
    }
  }
`;

const getMocks = () => {
  let callCount = 0;
  return {
    getCallCount: () => callCount,
    mocks: [
      {
        request: {
          query: NumQuery,
          variables: {
            num: 1
          }
        },
        result: () =>
          ++callCount && {
            result: {
              add5: {
                result: 6
              }
            }
          }
      },
      {
        request: {
          query: NumQuery,
          variables: {
            num: 0
          }
        },
        result: () =>
          ++callCount && {
            result: {
              add5: {
                result: 5
              }
            }
          }
      }
    ]
  };
};

it("should not poll when variables change if skip is true", async () => {
  const propsInitial = {
    skip: true,
    pollInterval: 200,
    variables: { num: 0 }
  };
  const propsWithChangedVariables = {
    ...propsInitial,
    variables: { num: 1 }
  };

  const { mocks, getCallCount } = getMocks();

  const { rerender, result } = renderHook(
    ({ variables, skip, pollInterval }) =>
      useQuery(NumQuery, { skip, pollInterval, variables }),
    {
      initialProps: propsInitial,
      wrapper: ({ children }) => {
        return <MockedProvider mocks={mocks}>{children}</MockedProvider>;
      }
    }
  );

  await new Promise(resolve => setTimeout(resolve, 2000));

  expect(result.data).toBe(undefined);

  expect(getCallCount()).toBe(0);

  rerender(propsWithChangedVariables);

  await new Promise(resolve => setTimeout(resolve, 2000));

  expect(result.data).toBe(undefined);

  expect(getCallCount()).toBe(0);
});
