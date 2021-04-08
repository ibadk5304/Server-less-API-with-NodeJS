const dataservice = require('../dataservice');

module.exports = async function (context, req) {

    try{
        context.res ={
            body: await dataservice.getAllInstructors(),
            headers:{
                "content-type":"application/json"
            }
        }
    } catch(ex){
        //handle an error
        context.res ={
            status: 400,
            body: `An error occured${ex}`
        }
    }


}