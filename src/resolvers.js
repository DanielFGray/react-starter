const resolvers = {
  Query: {
    // foo: async (root, { variables }) => {},
    getList: () => [{
      id: 1,
      content: 'hello world',
      seed: Math.random(),
    }],
  },
}

export default resolvers
