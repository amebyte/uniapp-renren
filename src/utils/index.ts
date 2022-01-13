export function isWeixin() {
  return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1
}
