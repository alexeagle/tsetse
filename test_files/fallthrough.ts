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
  case 2:
  case 3:
    console.log("3");
    break;
// FIXME(alexeagle): handle this one too
//  case 4: {
//    console.log("4");
//    break;
//  }
  // It's okay in the last clause
  default:
    console.log("default");
}

let p = () => {
  switch(1) {
    case 1:
      return true;
    case 2:
      return false;
    // FIXME: handle this case
    //case 3:
    //  if (1 === 2) {
    //    return true;
    //  } else {
    //    return false;
    //  }
    case 4:
  }
}