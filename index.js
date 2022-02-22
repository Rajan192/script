
//Find DomainUUID from profiles collections
var url="nimativ.com"
var data=db.profiles.find({domain:url});
var result={};
 data.forEach(e => {    
    //Fetch every title related to domainuuid
    var data2=db.campaigns.find({domainUUID:e.domainUUID})
    data2.forEach(Element=>{  
         result[Element.title]=result[Element.title]?result[Element.title]+1:1;
    })
});
print(JSON.stringify(result))


//2

var collection="rajan";
 var postFixUrl="google.com";
var data=db[collection].find();
data.forEach(element => {
     var nameUrl=(element.name);
     var nameArray=nameUrl.split('.',1);
     var newUrl=nameArray+'.'+postFixUrl;   
     var re=db[collection].updateOne({name:nameUrl},{$set:{name:newUrl}});
});


//3

var key="domain";
var allCollection=db.getCollectionNames();
for(collection of allCollection){
    var result=(db[collection].findOne({[key]:{$exists:true}}));
    if(result!=null){
     print("collection name is",collection);
    }  
}

//4

const mysql = require("mysql");
const { join } = require("path");
const util = require('util');
const stripe = require('stripe')('');

(async () => {
    const synApp_mysql = {
        host: 'localhost',
        user: 'root',
        password: 'pass',
        database: 'synapp'

    };

    mysqlConnection = mysql.createConnection(synApp_mysql);
    mysqlConnection.connect();
    mysqlQuery = util.promisify(mysqlConnection.query).bind(mysqlConnection);

    q = `select * from field_data_field_customer_profile_data`;
    var data = await mysqlQuery(q);
    // check, data should not be empty
    if (data.length > 0) {
        for (user of data) {


            if (!checkSubscriptionId(user)) {
                
                var entity_id = user.entity_id;
                q = `select field_customer_stripe_id_value from field_data_field_customer_stripe_id where entity_id=${entity_id} limit 1`;
               stripe_id_of_customer = await mysqlQuery(q);
              //  it will be at 0 indext of fetched data
               cus_id = (stripe_id_of_customer[0].field_customer_stripe_id_value);
             //   fetch subscription_id from stripe by using cus_id
               var subscription_id = await fetch_subscription_id(cus_id);
             //   now add this subscription id to table 
              if(subscription_id){
                add_subscription_id_to_user(subscription_id,user,entity_id);
              }
               
             }
         
        }
    }
    //close connection
await mysqlConnection.end();
  
   
})();


function checkSubscriptionId(user) {
   
    field_customer_profile_data_value = JSON.parse(user.field_customer_profile_data_value);
   // console.log(user.field_customer_profile_data_value);
    if (field_customer_profile_data_value.subscriptions.subscription_id && user.status) {
        return true;
    }
    else {
        return false;
    }
   
}

function fetch_subscription_id(cus_id) {


    var cus_id;
    (async () => {
        const subscriptions = await stripe.subscriptions.list({ status: 'active', customer: `${cus_id}` });
        cus_id= subscriptions.data[0].id;
        
    })()
    return cus_id;
}

async function  add_subscription_id_to_user(subscription_id,user,entity_id){
    field_customer_profile_data_value = JSON.parse(user.field_customer_profile_data_value);
    field_customer_profile_data_value.subscriptions.subscription_id=subscription_id;
    //change it into string
     var stringfy_value=JSON.stringify(field_customer_profile_data_value);
     q=`update field_data_field_customer_profile_data set field_customer_profile_data_value = '${stringfy_value}' where entity_id=${entity_id}`;
     updateTable=await mysqlQuery(q);
  
}


//5


const mysql=require('mysql');
const util =require('util');

(async()=>{
    const synAppMysql={
        host:'localhost',
        user:'root',
        password:'pass',
        database:'synapp'
    };
    mysqlConnection=mysql.createConnection(synAppMysql);
    mysqlConnection.connect();
    mysqlQuery=util.promisify(mysqlConnection.query).bind(mysqlConnection);

   q='select * from field_data_field_customer_profile_data';
    var data = await mysqlQuery(q);
    console.log("mail,entity_id");
    for(user of data){
        var field_customer_profile_data_value=JSON.parse(user.field_customer_profile_data_value);
      
   
        if(field_customer_profile_data_value.subscriptions.subscription_id==undefined){
  
            var entity_id=user.entity_id;
            q=`select * from users where uid=${entity_id}`;
            usersTableData=await mysqlQuery(q);

            if(usersTableData.length>0){
               
                console.log(usersTableData[0].mail,entity_id);
            }
            
        }
    }
    await mysqlConnection.end();
})();








