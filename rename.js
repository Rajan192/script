db.campaigns.updateMany( 
    { }, 
    { $rename: { "tittle": "title" } } 
  )