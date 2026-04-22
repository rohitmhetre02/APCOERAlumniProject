import { pool } from '../config/database.js';

class News {
  static schema = {
    tableName: 'news',
    columns: [
      'id UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      'title VARCHAR(255) NOT NULL',
      'slug VARCHAR(255) UNIQUE NOT NULL',
      'category VARCHAR(100) NOT NULL',
      'short_content TEXT',
      'full_content TEXT NOT NULL',
      'image_url VARCHAR(500)',
      'author_id UUID NOT NULL',
      'author_role VARCHAR(20) NOT NULL',
      'status VARCHAR(20) DEFAULT \'pending\'',
      'views INTEGER DEFAULT 0',
      'likes INTEGER DEFAULT 0',
      'comments INTEGER DEFAULT 0',
      'tags TEXT[]',
      'featured BOOLEAN DEFAULT false',
      'published_at TIMESTAMP',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    ]
  };

  static async createTable() {
    try {
      const columns = this.schema.columns.join(', ');
      const query = `
        CREATE TABLE IF NOT EXISTS ${this.schema.tableName} (
          ${columns}
        );
      `;

      await pool.query(query);
      console.log(`✅ ${this.schema.tableName} table created successfully`);

      // Create indexes
      await this.createIndexes();
      
    } catch (error) {
      console.error(`❌ Error creating ${this.schema.tableName} table:`, error.message);
      throw error;
    }
  }

  static async createIndexes() {
    try {
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_news_author_id ON news(author_id)',
        'CREATE INDEX IF NOT EXISTS idx_news_status ON news(status)',
        'CREATE INDEX IF NOT EXISTS idx_news_category ON news(category)',
        'CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at)',
        'CREATE INDEX IF NOT EXISTS idx_news_featured ON news(featured)',
        'CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug)'
      ];

      for (const indexQuery of indexes) {
        await pool.query(indexQuery);
      }

      console.log('✅ News indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating news indexes:', error.message);
      throw error;
    }
  }

  static async generateSlug(title) {
    try {
      let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      // Check if slug exists and make it unique
      let counter = 1;
      let originalSlug = slug;
      
      while (true) {
        const checkQuery = `SELECT id FROM ${this.schema.tableName} WHERE slug = $1`;
        const result = await pool.query(checkQuery, [slug]);
        
        if (result.rows.length === 0) {
          break;
        }
        
        slug = `${originalSlug}-${counter}`;
        counter++;
      }

      return slug;
    } catch (error) {
      console.error('❌ Error generating slug:', error.message);
      throw error;
    }
  }

  static async create(newsData) {
    try {
      const {
        title,
        category,
        short_content,
        full_content,
        image_url,
        author_id,
        author_role,
        tags,
        featured = false
      } = newsData;

      const slug = await this.generateSlug(title);
      
      const query = `
        INSERT INTO ${this.schema.tableName} (
          title, slug, category, short_content, full_content, 
          image_url, author_id, author_role, tags, featured, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        title, slug, category, short_content, full_content,
        image_url, author_id, author_role, tags, featured,
        author_role === 'admin' ? 'approved' : 'pending'
      ];

      const result = await pool.query(query, values);
      const news = result.rows[0];

      console.log(`✅ News article created: ${news.title}`);
      return news;
    } catch (error) {
      console.error('❌ Error creating news article:', error.message);
      throw error;
    }
  }

  static async getAll(status = 'approved') {
    try {
      let query = `
        SELECT n.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email
        FROM ${this.schema.tableName} n
        LEFT JOIN users u ON n.author_id = u.id
      `;

      let params = [];
      
      if (status !== 'all') {
        query += ' WHERE n.status = $1 ORDER BY n.published_at DESC, n.created_at DESC';
        params.push(status);
      } else {
        query += ' ORDER BY n.published_at DESC, n.created_at DESC';
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching news articles:', error.message);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT n.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email
        FROM ${this.schema.tableName} n
        LEFT JOIN users u ON n.author_id = u.id
        WHERE n.id = $1
      `;

      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding news article by ID:', error.message);
      throw error;
    }
  }

  static async findBySlug(slug) {
    try {
      const query = `
        SELECT n.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email
        FROM ${this.schema.tableName} n
        LEFT JOIN users u ON n.author_id = u.id
        WHERE n.slug = $1
      `;

      const result = await pool.query(query, [slug]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error finding news article by slug:', error.message);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const query = `
        UPDATE ${this.schema.tableName} 
        SET status = $1, 
            published_at = CASE 
              WHEN $1 = 'approved' AND published_at IS NULL THEN CURRENT_TIMESTAMP 
              ELSE published_at 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [status, id]);
      const news = result.rows[0];

      if (!news) {
        throw new Error('News article not found');
      }

      console.log(`✅ News ${news.id} status updated to: ${status}`);
      return news;
    } catch (error) {
      console.error('❌ Error updating news status:', error.message);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const {
        title,
        category,
        short_content,
        full_content,
        image_url,
        tags,
        featured
      } = updateData;

      let slug;
      if (title) {
        slug = await this.generateSlug(title);
      }

      const query = `
        UPDATE ${this.schema.tableName} 
        SET 
          title = COALESCE($1, title),
          slug = COALESCE($2, slug),
          category = COALESCE($3, category),
          short_content = COALESCE($4, short_content),
          full_content = COALESCE($5, full_content),
          image_url = COALESCE($6, image_url),
          tags = COALESCE($7, tags),
          featured = COALESCE($8, featured),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `;

      const values = [
        title, slug, category, short_content, full_content,
        image_url, tags, featured, id
      ];

      const result = await pool.query(query, values);
      const news = result.rows[0];

      if (!news) {
        throw new Error('News article not found');
      }

      console.log(`✅ News article updated: ${news.title}`);
      return news;
    } catch (error) {
      console.error('❌ Error updating news article:', error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const query = `DELETE FROM ${this.schema.tableName} WHERE id = $1`;
      const result = await pool.query(query, [id]);
      
      if (result.rowCount === 0) {
        throw new Error('News article not found');
      }
      
      console.log(`✅ News article ${id} deleted`);
    } catch (error) {
      console.error('❌ Error deleting news article:', error.message);
      throw error;
    }
  }

  static async getCategories() {
    try {
      const query = `
        SELECT DISTINCT category, COUNT(*) as count
        FROM ${this.schema.tableName}
        WHERE status = 'approved'
        GROUP BY category
        ORDER BY count DESC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching categories:', error.message);
      throw error;
    }
  }

  static async getFeatured(limit = 5) {
    try {
      const query = `
        SELECT n.*, 
               u.first_name || ' ' || u.last_name as author_name,
               u.email as author_email
        FROM ${this.schema.tableName} n
        LEFT JOIN users u ON n.author_id = u.id
        WHERE n.status = 'approved' AND n.featured = true
        ORDER BY n.published_at DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error fetching featured news:', error.message);
      throw error;
    }
  }

  static async incrementViews(newsId) {
    try {
      const query = `
        UPDATE ${this.schema.tableName} 
        SET views = views + 1 
        WHERE id = $1
      `;
      
      await pool.query(query, [newsId]);
    } catch (error) {
      console.error('❌ Error incrementing views:', error.message);
      throw error;
    }
  }

  // Get news articles created by a specific author
  static async getByAuthor(authorId) {
    try {
      // First try without join to see if the basic query works
      const basicQuery = `
        SELECT *
        FROM ${this.schema.tableName}
        WHERE author_id = $1
        ORDER BY created_at DESC
      `;

      const basicResult = await pool.query(basicQuery, [authorId]);
      
      // If basic query works, try with join
      if (basicResult.rows.length > 0) {
        const query = `
          SELECT n.*, 
                 COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as author_name,
                 COALESCE(u.email, 'unknown@example.com') as author_email
          FROM ${this.schema.tableName} n
          LEFT JOIN users u ON n.author_id = u.id
          WHERE n.author_id = $1
          ORDER BY n.created_at DESC
        `;

        const result = await pool.query(query, [authorId]);
        return result.rows;
      }
      
      return basicResult.rows;
    } catch (error) {
      console.error('❌ Error fetching news by author:', error.message);
      console.error('❌ Author ID:', authorId);
      console.error('❌ Table name:', this.schema.tableName);
      throw error;
    }
  }
}

export default News;
