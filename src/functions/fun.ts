
function hasUpperAndLower(str:string):boolean {
  return /[a-z]/.test(str) && /[A-Z]/.test(str);
}

export {
    hasUpperAndLower
}