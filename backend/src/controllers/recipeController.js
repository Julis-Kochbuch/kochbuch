import bcrypt from 'bcrypt';
import fs from "fs/promises";

import * as db from '../db/index.js';
import { uploadDir } from './uploadsController.js';
import console from 'console';

const allRecipesGet = async (req, res) => {
    const result = await db.query(`
        SELECT r.id, r.name, c.id AS category_id, c.name AS category_name, a.role
        FROM recipes r
        LEFT JOIN categories c ON r.category_id = c.id
        JOIN access_permissions a ON r.id = a.recipe_id AND a.key_id = $1
        ORDER BY LOWER(c.name) NULLS FIRST, LOWER(r.name);
        `,
        [req.session.apiKeyId]
    );

    /* das kann später die Datenbank selber machen */

    let currentCategoryId = undefined;
    let parsedResult = [{recipes: []}]

    result.rows.forEach(recipe => {
        if (recipe.category_id === currentCategoryId) {
            parsedResult[parsedResult.length - 1].recipes.push({id: recipe.id, name: recipe.name});
        } else {
            parsedResult.push({category_name: recipe.category_name, recipes: []});
            parsedResult[parsedResult.length - 1].recipes.push({id: recipe.id, name: recipe.name});
            currentCategoryId = recipe.category_id;
        }
    });

    res.status(200).json(parsedResult);
}

const categoriesGet = async (req, res) => {
    const result = await db.query(`
        SELECT *
        FROM categories
        ORDER BY LOWER(name);
        `
    );

    res.status(200).json(result.rows);
}

const categoryDelete = async (req, res) => {
    const { id } = req.params;

    await db.query(`
        DELETE FROM categories
        WHERE id = $1;
        `, [id]);
    
    res.status(200).json({ message: 'Category deleted' });
}

const categoryPost = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    await db.query(`
        UPDATE categories
        SET
            name = $2
        WHERE id = $1;
        `, [id, name])
        .catch(err => {
            if (err.code === '22001') {
                return res.status(400).json({ message: 'Name too long' });
            }

            if (err.code === '23502') {
                return res.status(400).json({ message: 'Name must not be empty' });
            }

            if (err.code === '23505') {
                return res.status(400).json({ message: 'Category already exists' });
            }
            
            return res.status(400).json({ message: 'Bad Request' });
        });
    
    res.status(200).json({ message: 'User deleted' });
}

const newCategoryPost = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name must not be empty' });
    }

    const client = await db.pool.connect();

    try {
        await client.query(`BEGIN`);
        
        const recipe_result = await client.query(`
            INSERT INTO categories (name)
            VALUES ($1)
            RETURNING id;
            `, [name]);

        const categoryId = recipe_result.rows[0].id;

        await client.query('COMMIT');

        res.status(201).json({ message: 'Category created successfully', id: categoryId });
    } catch (err) {
        await client.query('ROLLBACK');

        console.error(err);

        if (err.code === '22001') {
                return res.status(400).json({ message: 'Name too long' });
            }

        if (err.code === '23505') {
            return res.status(400).json({ message: 'Category already exists' });
        }

        res.status(500).json({
            message: 'Creating category failed'
        });

    } finally {
        client.release();
    }
}

const newRecipePost = async (req, res) => {
    const { name, category_id, servings, images, ingredients, steps } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name must not be empty' });
    }
    else if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: 'Ingredients must not be empty' });
    }
    else if (!Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json({ message: 'Steps must not be empty' });
    }

    const client = await db.pool.connect();

    try {
        await client.query(`BEGIN`);
        
        const recipe_result = await client.query(`
            INSERT INTO recipes (name, category_id, servings)
            VALUES ($1, $2, $3)
            RETURNING id;
            `, [name, category_id ?? null, servings ?? null]);

        const recipeId = recipe_result.rows[0].id;

        await Promise.all(
            images.map(image =>
                client.query(`
                    INSERT INTO recipe_images (recipe_id, slot, caption)
                    VALUES ($1, $2, $3);
                `, [recipeId, image.slot, image.caption])
            )
        );

        await Promise.all(
            steps.map(step =>
                client.query(`
                    INSERT INTO steps (recipe_id, index_number, text)
                    VALUES ($1, $2, $3)
                    RETURNING id;
                `, [recipeId, step.index_number, step.text])
            )
        );

        await Promise.all(
            ingredients.map(ingredient =>
                client.query(`
                    INSERT INTO ingredients (recipe_id, index_number, amount, unit, text, comment)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING id;
                `, [recipeId, ingredient.index_number, ingredient.amount ?? null, ingredient.unit ?? null, ingredient.text, ingredient.comment ?? null])
            )
        );

        await client.query(`
            INSERT INTO access_permissions (key_id, recipe_id, role)
            VALUES ($1, $2, $3);
            `, [req.session.apiKeyId, recipeId, 10]);

        await client.query('COMMIT');

        res.status(201).json({ message: 'Recipe created successfully', id: recipeId });
    } catch (err) {
        await client.query('ROLLBACK');

        console.error(err);

        if (err.code === '22001') {
            return res.status(400).json({ message: 'Too long string submitted' });
        }

        res.status(500).json({
            message: 'Creating recipe failed'
        });

    } finally {
        client.release();
    }
}

const recipeDelete = async (req, res) => {
    const { id } = req.params;

    const authorization_result = await db.query(`
        SELECT (a.role = 10) AS is_authorized
        FROM access_permissions a
        WHERE a.recipe_id = $1 AND a.key_id = $2;
        `,
        [id, req.session.apiKeyId]
    );

    if (!authorization_result.rows[0]?.is_authorized) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    await db.query(`
        DELETE FROM recipes
        WHERE id = $1;
        `, [id]);

    await fs.rm(`${uploadDir}/recipe-${id}`, { recursive: true, force: true });

    res.status(200).json({ message: 'Recipe deleted' });
}

const recipeGet = async (req, res) => {
    const { id } = req.params;

    const recipe_data = await db.query(`
        SELECT r.id, r.name, c.id AS category_id, c.name AS category_name, r.servings, a.role
        FROM recipes r
        LEFT JOIN categories c ON r.category_id = c.id
        LEFT JOIN access_permissions a ON r.id = a.recipe_id AND a.key_id = $1
        WHERE r.id = $2;
        `,
        [req.session.apiKeyId, id]
    );

    if (recipe_data.rows.length === 0) {
        return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe_data.rows[0].role === null) {
        return res.status(403).json({ message: 'Recipe not permitted to access' });
    }

    const recipe_author = await db.query(`
        SELECT u.name
        FROM recipes r
        LEFT JOIN access_permissions a ON r.id = a.recipe_id AND a.role = 10
        LEFT JOIN api_keys_inner k ON k.id = a.key_id
        LEFT JOIN users u ON u.id = k.user_id
        WHERE r.id = $1;
        `,
        [id]
    );

    const images_data = await db.query(`
        SELECT i.id, i.caption, i.slot
        FROM recipe_images i
        WHERE i.recipe_id = $1
        ORDER BY slot ASC;
        `,
        [id]
    );

    const ingredients_data = await db.query(`
        SELECT id, amount, unit, text, comment, step_id
        FROM ingredients
        WHERE recipe_id = $1
        ORDER BY index_number ASC;
        `,
        [id]
    );

    const steps_data = await db.query(`
        SELECT id, text
        FROM steps
        WHERE recipe_id = $1
        ORDER BY index_number ASC;
        `,
        [id]
    );

    res.status(200).json({
        "id": recipe_data.rows[0].id,
        "name": recipe_data.rows[0].name,
        "author": recipe_author.rows[0].name,
        "category_id": recipe_data.rows[0].category_id,
        "category_name": recipe_data.rows[0].category_name,
        "servings": recipe_data.rows[0].servings,
        "role":  recipe_data.rows[0].role,
        "images": images_data.rows,
        "ingredients": ingredients_data.rows,
        "steps": steps_data.rows
    });
}

const recipePost = async (req, res) => {
    const { id } = req.params;
    const { name, category_id, servings, images, ingredients, steps } = req.body;

    const authorization_result = await db.query(`
        SELECT (a.role = 10) AS is_authorized
        FROM access_permissions a
        WHERE a.recipe_id = $1 AND a.key_id = $2;
        `,
        [id, req.session.apiKeyId]
    );

    if (!authorization_result.rows[0]?.is_authorized) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (!name) {
        return res.status(400).json({ message: 'Name must not be empty' });
    }
    else if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ message: 'Ingredients must not be empty' });
    }
    else if (!Array.isArray(steps) || steps.length === 0) {
        return res.status(400).json({ message: 'Steps must not be empty' });
    }

    const client = await db.pool.connect();

    try {
        await client.query(`BEGIN`);
        
        await client.query(`
            UPDATE recipes
            SET
                name = $2,
                category_id = $3,
                servings = $4
            WHERE id = $1;
            `, [id, name, category_id ?? null, servings ?? null]);
        
        if (images.length === 0) {
            await client.query(`
                DELETE FROM recipe_images
                WHERE recipe_id = $1;
                `, [id]);

                await fs.rm(`${uploadDir}/recipe-${id}`, { recursive: true, force: true });
        } else {
            const image_response = await client.query(`
                DELETE FROM recipe_images
                WHERE recipe_id = $1
                    AND id <> ALL($2::int[])
                RETURNING slot;
                `, [id, images.filter(image => Number.isInteger(image.id)).map(image => {return image.id})]);

            const deleted_files = image_response.rows.map(file => {return `${file.slot}.webp`});

            for (const file of deleted_files) {
                await fs.rm(`${uploadDir}/recipe-${id}/${file}`, { recursive: true, force: true });
            }
            
            await Promise.all(
                images.filter(image => {return Number.isInteger(image.id)}).map(image =>
                    client.query(`
                        UPDATE recipe_images
                        SET
                            slot = $2,
                            caption = $3
                        WHERE id = $1;
                    `, [image.id, image.slot, image.caption])
                )
            );

            await Promise.all(
                images.filter(image => {return !Number.isInteger(image.id)}).map(image =>
                    client.query(`
                        INSERT INTO recipe_images (recipe_id, slot, caption)
                        VALUES ($1, $2, $3)
                        ON CONFLICT DO NOTHING;
                    `, [id, image.slot, image.caption])
                )
            );
        }

        await client.query(`
            DELETE FROM ingredients
            WHERE recipe_id = $1
                AND id <> ALL($2::int[]);
            `, [id, ingredients.map(ingredient => {return ingredient.id})]);

        await Promise.all(
            ingredients.filter(ingredient => {return Number.isInteger(ingredient.id)}).map(ingredient =>
                client.query(`
                    UPDATE ingredients
                    SET
                        index_number = $2,
                        amount = $3,
                        unit = $4,
                        text = $5,
                        comment = $6
                    WHERE id = $1;
                `, [ingredient.id, ingredient.index_number, ingredient.amount, ingredient.unit, ingredient.text, ingredient.comment])
            )
        );

        await Promise.all(
            ingredients.filter(ingredient => {return !Number.isInteger(ingredient.id)}).map(ingredient =>
                client.query(`
                    INSERT INTO ingredients (recipe_id, index_number, amount, unit, text, comment)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `, [id, ingredient.index_number, ingredient.amount, ingredient.unit, ingredient.text, ingredient.comment])
            )
        );

        await client.query(`
            DELETE FROM steps
            WHERE recipe_id = $1
                AND id <> ALL($2::int[]);
            `, [id, steps.map(step => {return step.id})]);

        await Promise.all(
            steps.filter(step => {return Number.isInteger(step.id)}).map(step =>
                client.query(`
                    UPDATE steps
                    SET
                        index_number = $2,
                        text = $3
                    WHERE id = $1;
                `, [step.id, step.index_number, step.text])
            )
        );

        await Promise.all(
            steps.filter(step => {return !Number.isInteger(step.id)}).map(step =>
                client.query(`
                    INSERT INTO steps (recipe_id, index_number, text)
                    VALUES ($1, $2, $3);
                `, [id, step.index_number, step.text])
            )
        );

        await client.query('COMMIT');

        res.status(201).json({ message: 'Recipe modified successfully', id: id });
    } catch (err) {
        await client.query('ROLLBACK');

        console.error(err);

        if (err.code === '22001') {
            return res.status(400).json({ message: 'Too long string submitted' });
        }

        res.status(500).json({
            message: 'Modifying recipe failed'
        });

    } finally {
        client.release();
    }
}

const recipeShareGet = async (req, res) => {
    const { id } = req.params;

    const authorization_result = await db.query(`
        SELECT (a.role = 10) AS is_authorized
        FROM access_permissions a
        WHERE a.recipe_id = $1 AND a.key_id = $2;
        `,
        [id, req.session.apiKeyId]
    );

    if (!authorization_result.rows[0]?.is_authorized) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const result = await db.query(`
        SELECT a.key_id
        FROM access_permissions a
        WHERE a.recipe_id = $1 AND a.key_id <> $2;
        `,
        [id, req.session.apiKeyId]
    );

    res.status(200).json(result.rows);
}

const recipeSharePost = async (req, res) => {
    const { recipe_id, selected_users, removed_users } = req.body;
    const { id } = req.params;

    const authorization_result = await db.query(`
        SELECT (a.role = 10) AS is_authorized
        FROM access_permissions a
        WHERE a.recipe_id = $1 AND a.key_id = $2;
        `,
        [id, req.session.apiKeyId]
    );

    if (!authorization_result.rows[0]?.is_authorized) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const client = await db.pool.connect();

    try {
        await client.query(`BEGIN`);

        await Promise.all(
            selected_users.map(user =>
                client.query(`
                    INSERT INTO access_permissions (key_id, recipe_id)
                    VALUES ($1, $2)
                    ON CONFLICT DO NOTHING;
                `, [user, recipe_id])
            )
        );

        await Promise.all(
            removed_users.map(user =>
                client.query(`
                    DELETE FROM access_permissions
                    WHERE key_id = $1 AND recipe_id = $2;
                `, [user, recipe_id])
            )
        );
        
        await client.query('COMMIT');

        res.status(201).json({ message: 'Shared with users successfully' });
    } catch (err) {
        await client.query('ROLLBACK');

        console.error(err);

        res.status(500).json({
            message: 'Creating category failed'
        });

    } finally {
        client.release();
    }
}

export default {allRecipesGet, categoriesGet, categoryDelete, categoryPost, newCategoryPost, newRecipePost, recipeDelete, recipeGet, recipePost, recipeShareGet, recipeSharePost}