const {Connection, Request} = require('tedious');
const config = require('./config')
module.exports = {
    getAllSemesterData: ()=>{
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
                    `SELECT s.Id, Name, s.StartDate, s.EndDate, a.Title AS AcademicYear FROM semesters s
                    inner join academicyears a
                    ON s.academicyearid = a.id `,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSql(request)

                const semesters = []

                //Option 1
                // request.on('row', (columns)=>{
                    
                //     const semester ={}
                //     columns.forEach(column => {
                //         semester[column.metadata.colName] = column.value
                //     })

                //     semesters.push(semester)
                //     //create an object and add it to some list/array
                // })

                // Option 2 
                request.on('doneInProc', (rowCount, more, rows)=>{
                    const semesters = []
                    rows.forEach(row =>{
                        const semester ={}
                        row.forEach(column=>{
                            semester[column.metadata.colName] = column.value
                          
                        })
                          semesters.push(semester)
                    })
                    resolve(semesters)
                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
    getSemesterData: (semesterId)=>{
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
                    `
                    SELECT S.Id, S.Name, S.StartDate, S.EndDate from Semesters S
                    WHERE Id= ${semesterId};

                    Select Distinct C.Id, C.CourseCode, C.Title from Semesters S
                    Inner Join CourseOfferings CO on S.Id = CO.SemesterId
                    INNER JOIN Courses C on C.Id = CO.CourseId
                    where S.Id = ${semesterId}
                    ORDER BY C.CourseCode;
                    `
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
    },
    getAllCourses: ()=>{
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
                    `SELECT * FROM Courses C
                    ORDER BY C.CourseCode; `
                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSql(request)

                const courses = []

               
                // Option 2 
                request.on('doneInProc', (rowCount, more, rows)=>{
                    
                    rows.forEach(row =>{
                        const course ={}
                        row.forEach(column=>{
                            course[column.metadata.colName] = column.value                        
                        })
                        courses.push(course)
                    })
                    resolve(courses)
                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
    getCourse: (courseId)=>{
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
                    `SELECT C.Id,C.Title,C.CourseCode FROM Courses C
                    WHERE C.Id =${courseId};

                    SELECT * from Courses C
                    WHERE Id IN
                        (SELECT CP.PrerequisiteId
                        FROM  CoursePrerequisites CP
                        where CP.CourseId = ${courseId})
                    ORDER BY C.CourseCode;

                    SELECT * from Courses C
                    WHERE Id IN
                        (SELECT CP.CourseId 
                        FROM  CoursePrerequisites CP 
                        where CP.PrerequisiteId = ${courseId})
                    ORDER BY C.CourseCode;                    
                    `
                //    `SELECT S.Id, S.StartDate,S.EndDate, S.EndDate, AY.Title AS AcademicYear FROM Semesters S
                //     INNER JOIN AcademicYears AY on AY.Id = S.AcademicYearId
                //     WHERE S.Id = ${req.params.id};

                //     SELECT DISTINCT C.CourseCode,C.Title FROM Courses C
                //     INNER JOIN CourseOfferings CO on C.Id = CO.CourseId
                //     WHERE CO.SemesterId =${req.params.id}
                //     ORDER BY C.CourseCode;`
                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSqlBatch(request)
              
                let course = null;
                const prerequisites =[]
                const isprerequisites =[]

                let resultSet = 0;
                request.on('done', (rowCount, more, rows)=>{
                    
                    //build our semester object 1st result set

                    //fill up courses taught //2nd result set
                    resultSet +=1

                    switch(resultSet){
                        case 1:{
                             if( rowCount === 1){
                                course={}                            
                                rows[0].forEach(column =>{
                                    course[column.metadata.colName] = column.value
                                })                          
                                
                            } 
                            break;
                        }
                        case 2:{
                            //fill the courses taught array 
                            rows.forEach(row =>{
                                const prerequisite = {}
                                row.forEach(column => {
                                    prerequisite[column.metadata.colName] = column.value
                                })
                                //add that course to that array 
                                prerequisites.push(prerequisite)
                            })
                            break;
                        }
                        case 3:{
                            //fill the courses taught array 
                            rows.forEach(row =>{
                                const isprerequisite = {}
                                row.forEach(column => {
                                    isprerequisite[column.metadata.colName] = column.value
                                })
                                //add that course to that array 
                                isprerequisites.push(isprerequisite)
                            })
                            break;
                        }
                    }
                   
                    if(course){
                        course.prerequisites= prerequisites
                        course.isprerequisites= isprerequisites

                    }
                    resolve(course)

                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
    getAllAcademicYears: ()=>{
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
                    `SELECT * FROM AcademicYears AY 
                    ORDER BY AY.Title DESC;`
                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSql(request)

                const academicyears = []

               
                // Option 2 
                request.on('doneInProc', (rowCount, more, rows)=>{
                    
                    rows.forEach(row =>{
                        const academicyear ={}
                        row.forEach(column=>{
                            academicyear[column.metadata.colName] = column.value
                            
                        })
                        academicyears.push(academicyear)
                    })
                    resolve(academicyears)
                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
    getAcademicYear: (academicyearId)=>{
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
                    `SELECT * FROM AcademicYears AY                    
                    WHERE AY.Id=${academicyearId};

                    SELECT S.ID, S.Name, S.StartDate ,S.EndDate
                    FROM AcademicYears AY
                    INNER JOIN Semesters S on AY.Id = S.AcademicYearId
                    WHERE AY.Id=${academicyearId}
                    ORDER BY S.StartDate DESC;

                    SELECT I.FirstName,I.LastName,DP.Title as DiplomaProgramName, DPY.Title as DiplomaProgramYear, DPYS.Title DiplomaProgramSection 
                    FROM AcademicYears AY
                    INNER JOIN DiplomaProgramYearSections DPYS on AY.Id = DPYS.AcademicYearId
                    INNER JOIN AdvisingAssignments AA on DPYS.Id = AA.DiplomaProgramYearSectionId
                    INNER JOIN Instructors I on I.Id = AA.InstructorId
                    INNER JOIN DiplomaProgramYears DPY on DPYS.DiplomaProgramYearId = DPY.Id
                    INNER JOIN DiplomaPrograms DP on DP.Id = DPY.DiplomaProgramId
                    WHERE AY.id = ${academicyearId}
                    ORDER BY DP.Title,DPY.Title,DPYS.Title;
                    `
                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSqlBatch(request)
              
                let academicyear = null;
                const advisingassignments =[]
                const semesters=[]

                let resultSet = 0;
                request.on('done', (rowCount, more, rows)=>{
                    
                    //build our semester object 1st result set

                    //fill up courses taught //2nd result set
                    resultSet +=1

                    switch(resultSet){
                        case 1:{
                             if( rowCount === 1){
                                academicyear={}                            
                                rows[0].forEach(column =>{
                                    academicyear[column.metadata.colName] = column.value
                                })                          
                                
                            } 
                            break;
                        }
                        case 2:{
                            //fill the courses taught array 
                            rows.forEach(row =>{
                                const semester = {}
                                row.forEach(column => {
                                    semester[column.metadata.colName] = column.value
                                })
                                //add that course to that array 
                                semesters.push(semester)
                            })
                            break;
                        }
                        case 3:{
                            //fill the courses taught array 
                            rows.forEach(row =>{
                                const advisingassignment = {}
                                row.forEach(column => {
                                    advisingassignment[column.metadata.colName] = column.value
                                })
                                //add that course to that array 
                                advisingassignments.push(advisingassignment)
                            })
                            break;
                        }
                        
                    }
                   
                    if(academicyear){
                        academicyear.advisingassignments= advisingassignments
                        academicyear.semesters = semesters
                    }
                    resolve(academicyear)

                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
    getAllDiplomaPrograms: ()=>{
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
                    `SELECT DP.Id, DP.Title,COUNT(*) DurationInYears FROM DiplomaPrograms DP
                    INNER JOIN DiplomaProgramYears DPY on DP.Id = DPY.DiplomaProgramId
                    GROUP BY DP.Id,DP.Title
                    HAVING COUNT(*)>=1
                    ORDER BY DP.Title;
                    `

                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSql(request)

                const diplomaprograms = []

               
                // Option 2 
                request.on('doneInProc', (rowCount, more, rows)=>{
                    
                    rows.forEach(row =>{
                        const diplomaprogram ={}
                        row.forEach(column=>{
                            diplomaprogram[column.metadata.colName] = column.value
                            
                        })
                        diplomaprograms.push(diplomaprogram)
                    })
                    resolve(diplomaprograms)
                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
    getDiplomaProgram: (diplomaprogramId)=>{
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
                    `SELECT * FROM DiplomaPrograms DP
                    WHERE DP.Id=${diplomaprogramId};

                     SELECT Distinct I.Id, DPY.Title as DiplomaProgramYear,
                    DPYS.Title as DiplomaProgramYearSection, I.FirstName,I.LastName FROM DiplomaPrograms DP
                    INNER JOIN DiplomaProgramYears DPY on DP.Id = DPY.DiplomaProgramId
                    INNER JOIN DiplomaProgramYearSections DPYS on DPY.Id = DPYS.DiplomaProgramYearId
                    INNER JOIN AdvisingAssignments AA on DPYS.Id = AA.DiplomaProgramYearSectionId
                    INNER JOIN Instructors I on I.Id = AA.InstructorId
                    INNER JOIN AcademicYears AY on AY.Id = DPYS.AcademicYearId
                    WHERE DP.Id=${diplomaprogramId}
                    ORDER BY DPY.Title, DPYS.Title;

                    `
                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSqlBatch(request)
              
                let diplomaprogram = null;
                const Advisors  =[]

                let resultSet = 0;
                request.on('done', (rowCount, more, rows)=>{
                    
                    //build our semester object 1st result set

                    //fill up courses taught //2nd result set
                    resultSet +=1

                    switch(resultSet){
                        case 1:{
                             if( rowCount === 1){
                                diplomaprogram={}                            
                                rows[0].forEach(column =>{
                                    diplomaprogram[column.metadata.colName] = column.value
                                })                          
                                
                            } 
                            break;
                        }
                        case 2:{
                            //fill the courses taught array 
                            rows.forEach(row =>{
                                const Advisor = {}
                                row.forEach(column => {
                                    Advisor[column.metadata.colName] = column.value
                                })
                                //add that course to that array 
                                Advisors.push(Advisor)
                            })
                            break;
                        }
                        
                    }
                   
                    if(diplomaprogram){
                        diplomaprogram.Advisors= Advisors
                    }
                    resolve(diplomaprogram)

                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
    getAllInstructors: ()=>{
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
                    `SELECT * FROM Instructors I
                        ORDER BY I.LastName`

                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSql(request)

                const instructors = []

               
                // Option 2 
                request.on('doneInProc', (rowCount, more, rows)=>{
                    
                    rows.forEach(row =>{
                        const instructor ={}
                        row.forEach(column=>{
                            instructor[column.metadata.colName] = column.value
                            
                        })
                        instructors.push(instructor)
                    })
                    resolve(instructors)
                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
    getInstructor: (instructorId)=>{
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
                    `SELECT * FROM Instructors I
                    WHERE I.Id=${instructorId};

                    SELECT AY.Title as AcademicYear,DP.Title as DiplomaProgram,
                    DPY.Title as DiplomaProgramYear,DPYS.Title as DiplomaProgramYearSection FROM Instructors I
                    INNER JOIN AdvisingAssignments AA on I.Id = AA.InstructorId
                    INNER JOIN DiplomaProgramYearSections DPYS on DPYS.Id = AA.DiplomaProgramYearSectionId
                    INNER JOIN DiplomaProgramYears DPY on DPY.Id = DPYS.DiplomaProgramYearId
                    INNER JOIN DiplomaPrograms DP on DP.Id = DPY.DiplomaProgramId
                    INNER JOIN AcademicYears AY on AY.Id = DPYS.AcademicYearId
                    WHERE I.Id=${instructorId}
                    GROUP BY AY.Title,DP.Title,DPY.Title,DPYS.Title
                    HAVING COUNT(*)>=1
                    ORDER BY AY.Title DESC,DP.Title, DPY.Title,DPYS.Title;

                    SELECT C.Id, C.Title as CourseName,C.CourseCode as CourseCode FROM Instructors I
                    INNER JOIN CourseOfferings CO on I.Id = CO.InstructorId
                    INNER JOIN Courses C on C.Id = CO.CourseId
                    WHERE I.Id=${instructorId}
                    GROUP BY C.Id, C.Title,C.CourseCode
                    HAVING COUNT(*)>=1
                    ORDER BY C.CourseCode;
                    `
                    ,(err,rowCount)=>{
                    if(err){
                        reject(err.message);
                    }
                })
                connection.execSqlBatch(request)
              
                let instructor = null;
                const advisingassignments  =[]
                const coursesTaught  =[]

                let resultSet = 0;
                request.on('done', (rowCount, more, rows)=>{
                    
                    //build our semester object 1st result set

                    //fill up courses taught //2nd result set
                    resultSet +=1

                    switch(resultSet){
                        case 1:{
                             if( rowCount === 1){
                                instructor={}                            
                                rows[0].forEach(column =>{
                                    instructor[column.metadata.colName] = column.value
                                })                          
                                
                            } 
                            break;
                        }
                        case 2:{
                            //fill the courses taught array 
                            rows.forEach(row =>{
                                const advisingassignment = {}
                                row.forEach(column => {
                                    advisingassignment[column.metadata.colName] = column.value
                                })
                                //add that course to that array 
                                advisingassignments.push(advisingassignment)
                            })
                            break;
                        }
                        case 3:{
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
                   
                    if(instructor){
                        instructor.advisingassignments= advisingassignments
                        instructor.coursesTaught= coursesTaught
                    }
                    resolve(instructor)

                })
            })

        })
     
        // format the data 
        
        //return the data 
    },
}

