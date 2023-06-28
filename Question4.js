const person = {
    id: 2,
    gender: 'mail'
  };
  
  const student = {
    name: "ravi",
    email: "ravi11@yopmail.com"
  };
  
  const combinedObject = {
    ...person,
    ...student
  };
  
  console.log(combinedObject);