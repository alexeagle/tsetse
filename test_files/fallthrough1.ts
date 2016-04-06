let a:number;
switch(a) {
  // BUG: missing break statement
  case 1:
    console.log("1");
  // BUG: missing break statement
  case 2:
    console.log("2");
  // BUG: missing break statement
  default:
    console.log("default");
  case 4:
    break;
}

switch(a) {
  case 3:
    console.log("3");
    break;
  // It's okay in the last clause
  default:
    console.log("default");
}
