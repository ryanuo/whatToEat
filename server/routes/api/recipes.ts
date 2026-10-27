export default defineEventHandler(async (event) => {
  const recipes = await loadRecipes(event)

  return {
    count: recipes.length,
    categories: [
      ...new Set(
        recipes
          .map(r => r.category)
          .filter(Boolean),
      ),
    ],
    recipes,
  }
})
