module.exports = {
  authentication: {
    options: {
      userName: process.env.DBUsername, // update me
      password: process.env.DBPassword // update me
    },
    type: "default"
  },
  server: process.env.DBServer, // update me
  options: {
    port:1433,
    database: process.env.DBName, //update me
    encrypt: true,
    rowCollectionOnDone: true
  }
};




// {
//     // server: 'localhost',
//     // authentication: {
//     //     type: 'default',
//     //     options: {
//     //         userName: process.env.DBUsername, 
//     //         password:process.env.DBPassword,
//     //     }
//     // },
//     // options:{
//     //     port:1433,
//     //     database:process.env.DBName,
//     //     encrypt: false,
//     //     rowCollectionOnDone: true
        
//     // }

//      server: process.env.DBServer,  //update me
//         authentication: {
//             type: 'default',
//             options: {
//                 userName: process.env.DBUsername, //update me
//                 password: process.env.DBPassword  //update me
//             }
//         },
//         options: {
//             // If you are on Microsoft Azure, you need encryption:
//             port:1433,
//             encrypt: false,
//             database: process.env.DBName,  //update me
//             rowCollectionOnDone: true
//         }
// }




 