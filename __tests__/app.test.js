const request = require("supertest");
const db = require("../db/connection");
const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const app = require("../app");
const jestSorted = require("jest-sorted");

beforeEach(() => {
  return seed(testData);
});
afterAll(() => {
  return db.end();
});

describe("app()", () => {
  describe("GET /api/topics", () => {
    test("status 200, responds with array of topics, with correct fields", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics).toBeInstanceOf(Array);
          topics.forEach((topic) => {
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
    test("status 400, returns an error when passed an id that is not existent", () => {
      return request(app)
        .get("/api/2000")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("cannot find id - bad request");
        });
    });
  });

  describe("GET /api/articles", () => {
    test('status 200, Query containing valid sort_by, order and topic returns array of objects with correct keys including comment_count', () => {
      return request(app)
      .get('/api/articles?sort_by=author&order=ASC&topic=mitch')
      .expect(200)
      .then(({ body }) => {
        const {articles} = body;
        articles.forEach((article) => {
         expect(article).toEqual(
           expect.objectContaining({
                      author: expect.any(String),
                      title: expect.any(String),
                      article_id: expect.any(Number),
                      body: expect.any(String),
                      topic: expect.any(String),
                      created_at: expect.any(String),
                      votes: expect.any(Number),
                      comment_count: expect.any(Number)
            })
         );
       });
      });
    });
    test('status 200, articles can be selected based on any valid topic=item, e.g topic=cats', () => {
      const expectedReturn =       {
                              article_id: 5,
                              title: 'UNCOVERED: catspiracy to bring down democracy',
                              topic: 'cats',
                              author: 'rogersop',
                              body: 'Bastet walks amongst us, and the cats are taking arms!',
                              created_at: '2020-08-03T13:14:00.000Z',
                              votes: 0,
                              comment_count: 2
                            };
      return request(app)
      .get('/api/articles?topic=cats')
      .expect(200)
      .then(({ body }) => {
        const {articles} = body;
        articles.forEach((article) => {
         expect(article).toEqual(expectedReturn);
       });
      });
    });
    test('status 200, articles can be sorted by any greenlisted column, eg title with default order (DESC)', () => {
      const expectedReturned_article_id_Order = [7, 5, 9, 4, 2, 10, 12, 1, 3, 8, 11, 6 ];
      return request(app)
             .get('/api/articles?sort_by=title')
             .expect(200)
             .then(({ body }) => {
               const {articles} = body;
               articles.forEach((article, i) => {
                expect(article.article_id).toEqual(expectedReturned_article_id_Order[i]);
              });
             });
    });
    test('status 200, articles can be ordered using order=ASC (DESCending is the default), but with the default sort_by (created_at)', () => {
      const expectedReturned_article_id_Order = [7, 11, 8, 4, 10, 9, 1, 5, 12, 2, 6, 3 ];
      return request(app)
             .get('/api/articles?order=ASC')
             .expect(200)
             .then(({ body }) => {
              const {articles} = body;
 
              articles.forEach((article, i) => {
               expect(article.article_id).toEqual(expectedReturned_article_id_Order[i]);
             });
            });
    });
    test('status 200, successful selection from test data using order=ASC (DESCending is the default), sort_by (author) with topic=mitch', () => {
      const expectedReturned_article_id_Order = [1, 9, 12, 3, 6, 7, 8, 11, 2, 4, 10 ];
      return request(app)
             .get('/api/articles?sort_by=author&order=ASC&topic=mitch')
             .expect(200)
             .then(({ body }) => {
              const {articles} = body;

              articles.forEach((article, i) => {
               expect(article.article_id).toEqual(expectedReturned_article_id_Order[i]);
             });
        });
    });
    test('status 400, rejects if > 3 distinct keys in the query', () => {
      return request(app)
      .get('/api/articles?sort_by=author&order=DESC&thing=ASC&topic=user')
      .expect(400)
      .then(({ body: {msg} }) => {
        expect(msg).toBe('Too many query keys');
      });
    });
    test('status 400, rejects an invalid key in the query', () => {
      return request(app)
      .get('/api/articles?sort_by=author&INVALID=DESC&topic=user')
      .expect(400)
      .then(({ body: {msg} }) => {
        expect(msg).toBe('Attempt to query on Invalid key');
      });
    });
    test('status 400, rejects for an invalid sort_by query, key is valid but the request is not', () => {
      return request(app)
      .get('/api/articles?sort_by=INVALID&order=DESC&topic=user')
      .expect(400)
      .then(({ body: {msg} }) => {
        expect(msg).toBe('Invalid sort query');
      });
    });
    test('status 400, rejects for an invalid order query', () => {
        return request(app)
          .get('/api/articles?sort_by=author&order=INVALID&topic=user, key is valid but the request is not')
          .expect(400)
          .then(({ body: {msg} }) => {
            expect(msg).toBe('Invalid order query');
          });
    });
    test('status 404, rejects if the query cannot find any results with nothing found', () => {
      return request(app)
             .get('/api/articles?sort_by=author&order=ASC&topic=user')
             .expect(404)
             .then(({ body: {msg} }) => {
               expect(msg).toBe('No results found for that query');
             });
    });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("status 200, responds with an article object and correct properties", () => {
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
          })
        );
      });
  });
  test("status 400, responds with invalid id when passed a bad id", () => {
    return request(app)
      .get("/api/articles/invalidid")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid id");
      });
  });
  test("status 404, responds with id does not exist when id passed is non existent", () => {
    return request(app)
      .get("/api/articles/102002")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("id not found - does not exist");
      });
  });
});

describe("GET /api/articles/:article_id (comment count)", () => {
  test("status 200, responds with an article object that contains a comment_count along with other properties", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toBeInstanceOf(Object);
        expect(article.comment_count).toBe(11);
        expect(article).toEqual(
          expect.objectContaining({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          })
        );
      });
  });
  test("status 400, responds with invalid id when passed a bad id", () => {
    return request(app)
      .get("/api/articles/invalidid")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid id");
      });
  });

  test("status 404, responds with id not found when passed an id that is correct type but non existent", () => {
    return request(app)
      .get("/api/articles/39249324")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("id not found - does not exist");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("status 200, responds with the updated article", () => {
    const chosenArticleId = 1;
    const updateArticle = { inc_votes: -1 };
    return request(app)
      .patch(`/api/articles/${chosenArticleId}`)
      .send(updateArticle)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article.article_id).toEqual(chosenArticleId);
        expect(article.votes).toEqual(99);
      });
  });
  test("status 400, responds with bad request error when passed a vote with invalid data type", () => {
    const chosenArticleId = 1;
    const updateArticle = { inc_votes: "invaliddata" };
    return request(app)
      .patch(`/api/articles/${chosenArticleId}`)
      .send(updateArticle)
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("invalid id");
      });
  });
  test("status 400, responds with bad request error when passed an invalid path", () => {
    const updateArticle = { inc_votes: -1 };
    return request(app)
      .patch(`/api/articles/invalidid`)
      .send(updateArticle)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid id");
      });
  });
  test("status 404, responds with id does not exist when passed an id that is non existent", () => {
    const updateArticle = { inc_votes: -1 };
    return request(app)
      .patch(`/api/articles/203920`)
      .send(updateArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("id not found - does not exist");
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("status 200, responds with an array of comment objects and other correct fields", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toBeInstanceOf(Array);
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
            })
          );
        });
      });
  });
  test("status 200, responds with the following keys for the second comment for article_id 1", () => {
    const exEntry2 = {
      comment_id: 2,
      votes: 14,
      created_at: "2020-10-31T03:03:00.000Z",
      author: "jonny",
      body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
    };
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments[1]).toEqual(exEntry2);
      });
  });

  test("status 404, responds with id does not exist when passed an id that is non existent", () => {
    return request(app)
      .get("/api/articles/20392301/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("id not found - does not exist");
      });
  });
  test("status 400, responds with invalid id error when passed a bad id", () => {
    return request(app)
      .get("/api/articles/invalidid/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid id");
      });
  });
});

describe("POST /api/articles/:article_id/comments, the request accepts a username and a body", () => {
  test("status:201, responds with inserted item", () => {
    const newCommentObj = {
      username: "icellusedkars",
      body: "Rain beats on my window and the moon lights up the dark",
    };
    const newCommentObj2 = {
      username: "butter_bridge",
      body: "shadows chasing midnight and the dogs out on the run begin to bark",
    };

    const expectedResult = {
      comment_id: 19,
      body: "Rain beats on my window and the moon lights up the dark",
      article_id: 8,
      author: "icellusedkars",
      votes: 0,
    };
    const expectedResult2 = {
      comment_id: 20,
      body: "shadows chasing midnight and the dogs out on the run begin to bark",
      article_id: 8,
      author: "butter_bridge",
      votes: 0,
    };

    return request(app)
      .post("/api/articles/8/comments")
      .send(newCommentObj)
      .expect(201)
      .then(({ body }) => {
        const { new_comment } = body;
        expect(new_comment).toEqual(expect.objectContaining(expectedResult));
        return request(app)
          .post("/api/articles/8/comments")
          .send(newCommentObj2)
          .expect(201)
          .then(({ body }) => {
            const { new_comment } = body;
            expect(new_comment).toEqual(
              expect.objectContaining(expectedResult2)
            );
          });
      });
  });
  test("status 400, responds with invali username error when passed an invalid username", () => {
    const newCommentObj = { username: "INVALIDUSER", body: "na" };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newCommentObj)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("invalid username");
      });
  });
  test("status 404, responds with id does not exist when passed an id that is non existent", () => {
    const newCommentObj = {
      username: "icellusedkars",
      body: "Rain beats on my window and the moon lights up the dark",
    };
    return request(app)
      .post("/api/articles/500/comments")
      .send(newCommentObj)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("id not found - does not exist");
      });
  });
});

describe("GET /api/users", () => {
  test("status 200, responds with array of users objects, with correct fields", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toBeInstanceOf(Array);
        users.forEach((user) => {
          expect(user).toEqual(
            expect.objectContaining({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            })
          );
        });
      });
  });
  test("status 400, responds with bad request error when passed an invalid path", () => {
    return request(app)
      .get("/api/invalid")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("cannot find id - bad request");
      });
  });

  describe("DEL /api/comments/:comment_id", () => {
    test("status 204, deletes the current comment based on a valid comment id", () => {
      return request(app)
        .delete("/api/comments/2")
        .expect(204)
        .then(() => {
          return request(app)

            .get("/api/articles/1/comments")
            .expect(200)
            .then(({ body }) => {
              expect(body.comments).toHaveLength(10);
              body.comments.forEach((comment, i) => {
                expect(comment.comment_id).not.toBe(2);
              });
              db.query(`SELECT * FROM comments WHERE comment_id = 2;`).then(
                ({ rows }) => {
                  expect(rows).toEqual([]);
                }
              );
            });
        });
    });

    test("status:404, responds with does not exist message for an id that is not present", () => {
      return request(app)
        .delete("/api/comments/99999")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("comment does not exist");
        });
    });

    test("status:404, responds with comment does not exist for -ve id", () => {
      return request(app)
        .delete("/api/comments/-1")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("comment does not exist");
        });
    });

    test("status:400, responds with invalid id message found message for bad id", () => {
      return request(app)
        .delete("/api/comments/not-an-id")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid id");
        });
    });
  });
});