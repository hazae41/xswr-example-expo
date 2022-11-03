import { FetcherMore, getSingleSchema, useFetch, useQuery, XSWR } from "@hazae41/xswr";
import { StatusBar } from 'expo-status-bar';
import { useCallback } from "react";
import { Button, SafeAreaView, Text } from 'react-native';

export interface JsonRpcRequest {
  endpoint: string,
  method: string,
  params: any[]
}

export interface JsonRpcResponse<T> {
  result: T
}

export async function fetchAsJsonRpc<T>(call: JsonRpcRequest, more: FetcherMore) {
  const { signal } = more
  const { endpoint, method, params } = call

  const id = ~~(Date.now() / 1000)

  const body = JSON.stringify({ jsonrpc: "2.0", id, method, params })
  const res = await fetch(endpoint, { method: "POST", body, signal })

  if (!res.ok) {
    const error = new Error(await res.text())
    return { error }
  }

  const data = await res.json() as T
  return { data }
}

export function getBalanceSchema() {
  return getSingleSchema<unknown>({
    endpoint: "https://rpc.ankr.com/eth",
    method: "eth_getBalance",
    params: ["0xd8da6bf26964af9d7eed9e03e53415d37aa96045", "latest"]
  }, fetchAsJsonRpc)
}

export function useBalanceQuery() {
  const query = useQuery(getBalanceSchema, [])
  useFetch(query)
  return query
}

function Balance() {
  const { data, error, refetch } = useBalanceQuery()

  const onRefreshPress = useCallback(() => {
    refetch()
  }, [refetch])

  return <>
    <Text>Data: {JSON.stringify(data) ?? "undefined"}</Text>
    <Text>Error: {JSON.stringify(error) ?? "undefined"}</Text>
    <Button
      title="Refresh"
      onPress={onRefreshPress} />
  </>
}

export default function App() {
  return (
    <XSWR.CoreProvider>
      <SafeAreaView>
        <StatusBar style="auto" />
        <Balance />
      </SafeAreaView>
    </XSWR.CoreProvider>
  );
}