const db = require("./db");
const inquirer = require('inquirer');


module.exports.add = async (title) => {
    const list = await db.read()
    list.push({title,done:false})
    await db.write(list)
}
module.exports.clear = async ()=>{
    await db.write([])
}

module.exports.showAll = async ()=>{
    const list = await db.read()
    inquirer
        .prompt({
            type: 'list',
            name: 'index',
            message:'选择任务',
            choices:[...list.map((task,index)=>{
                    return {name:`${index +1}.${task.title} ${task.done?'[√]' : '[_]'}`,value:index.toString()}
                }),{name: '+ 添加任务',value:'-1'},{name:'> 退出',value: '-2'}]
        })
        .then(answer=>{
            const index = parseInt(answer.index)
            if (index>=0){
                inquirer.prompt({
                    type:'list',name:'action',message:'选择下一步',
                    choices:[
                        {name:'已完成',value:'markAsDone'},
                        {name:'改任务',value:'updateTitle'},
                        {name:'删除',value:'remove'},
                        {name:'退出',value:'quit'},
                    ]
                }).then(answer2=>{
                    switch (answer2.action){
                        case 'markAsDone':
                            list[index].done = true
                            db.write(list)
                            break;
                        case 'updateTitle':
                            inquirer.prompt({
                                type:'input',
                                name:'title',
                                message:'新任务',
                                default: list[index].title
                            }).then(answer=>{
                                list[index].title = answer.title
                                db.write(list)
                            })
                            break
                        case 'remove':
                            list.splice(index,1)
                            db.write(list)
                            break
                    }
                })
            } else if (index === -1){
                inquirer.prompt({
                    type:'input',
                    name:'title',
                    message:'输入新任务'
                }).then(answer=>{
                    list.push({title: answer.title, done: false})
                    db.write(list)
                })
            }
        })
}