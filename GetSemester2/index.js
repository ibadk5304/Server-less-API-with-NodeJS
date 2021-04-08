const {Connection, Request} = require('tedious');
const config = require('../config')

module.exports = async function (context, req) {

    function getSemesterData(){
         // we want this function to return a promise

        return new Promise((resolve, reject)=>{
            
            // connet to the db 
            const connection = new Connection(config)
            connection.connect()

            connection.on('connect',err =>{
                if(err){
                    reject(err.message)
                }

                //execute a query
                const request = new Request(
                   `SELECT S.Id, S.StartDate,S.EndDate, S.EndDate, AY.Title AS AcademicYear FROM Semesters S
                    INNER JOIN AcademicYears AY on AY.Id = S.AcademicYearId
                    WHERE S.Id = ${req.params.id};

                    SELECT DISTINCT C.CourseCode,C.Title FROM Courses C
                    INNER JOIN CourseOfferings CO on C.Id = CO.CourseId
                    WHERE CO.SemesterId =${req.params.id}
                    ORDER BY C.CourseCode;`
                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSqlBatch(request)
              
                let semester = null;
                const coursesTaught =[]

                let resultSet = 0;
                request.on('done', (rowCount, more, rows)=>{
                    
                    //build our semester object 1st result set

                    //fill up courses taught //2nd result set
                    resultSet +=1

                    switch(resultSet){
                        case 1:{
                             if( rowCount === 1){
                                semester={}                            
                                rows[0].forEach(column =>{
                                    semester[column.metadata.colName] = column.value
                                })                          
                                
                            } 
                            break;
                        }
                        case 2:{
                            //fill the courses taught array 
                            rows.forEach(row =>{
                                const courseTaught = {}
                                row.forEach(column => {
                                    courseTaught[column.metadata.colName] = column.value
                                })
                                //add that course to that array 
                                coursesTaught.push(courseTaught)
                            })
                            break;
                        }
                    }
                   
                    if(semester){
                        semester.coursesTaught= coursesTaught

                    }
                    resolve(semester)

                })
            })

        })
     
        // format the data 
        
        //return the data 
    }

 

    try{
        const body = await getSemesterData()
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