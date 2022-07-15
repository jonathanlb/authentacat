export const ERR_400 = Promise.resolve(
  { status: 400, statusText: 'access denied'}) as Promise<Response>;

export const OK_200 = Promise.resolve(
  { status: 200, statusText: 'OK'}) as Promise<Response>;

export function jsonResult(result: any): Promise<Response> {
  return Promise.resolve({
    status: 200,
    json: () => Promise.resolve(result),
  }) as Promise<Response>;
}
