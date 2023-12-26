const knex = require("../database/knex")

class NotesController{
  
    async create(request, response) {
      const { title, description, tags } = request.body;
      const { user_id } = request.params;
  
      // Obtemos a propriedade 'rating' do corpo da requisição
      const rating = request.body.rating;
  
      // Converte a string de rating para um número inteiro
      const parsedRating = parseInt(rating, 10);
  
      // Verifica se parsedRating é um número inteiro entre 1 e 5
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return response.status(400).json({ error: 'Rating must be an integer between 1 and 5.' });
      }
  
      const [note_id] = await knex("movie_notes").insert({
        title,
        description,
        rating: parsedRating,
        user_id
      });
  
      const tagsInsert = tags.map(name => {
        return {
          note_id,
          name,
          user_id
        };
      });
  
      await knex("movie_tags").insert(tagsInsert);
  
      response.json();
    }
  

  async show(request, response){
   const {id} = request.params
   
   
   const note = await knex("movie_notes").where({id}).first();
   const tags = await knex("movie_tags").where({note_id: id}).orderBy("name");
   

   return response.json({
    ...note,
    tags,
   
   });
  }

  async delete(request, response){
    const {id} = request.params;

    try {
        await knex("movie_notes").where({id}).delete();
        return response.json({ success: true });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ success: false, error: "Error deleting note." });
    }
}

  async index(request, response){

  const {user_id, title} = request.query;

  const notes = await knex("movie_notes")
  .where({user_id})
  .whereLike("title", `%${title}%` )
  .orderBy("title");

  return response.json({notes});
}
}





module.exports = NotesController;