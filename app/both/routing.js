Router.route('post', {
  path: '/eventUpdate/',
  where: 'server',
  action: function() {
    console.log(this.request.body);
  },
});
