const dataservice = require('../dataservice')

module.exports = async function (context, req) {

    try{
        const body = await dataservice.getAcademicYear(req.params.id)
        context.res ={
            status: body ? 200 : 404,
            headers:{
                "content-type":"application/json"
            },
            body

        }
    } catch(ex){
        //handle an error
        context.res ={
            status: 400,
            body: `An error occured${ex}`
        }
    }
}