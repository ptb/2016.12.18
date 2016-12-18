MIN = config[:environment] == :production
EXT = 'xhtml'.freeze

activate :blog do |blog|
  Time.zone = 'America/New_York'

  blog.sources = "{title}/index.#{EXT}"
  blog.default_extension = '.slim'

  # blog.layout = 'blog'
  blog.permalink = '{title}'

  # blog.generate_tag_pages = true
  blog.tag_template = "articles.#{EXT}"
  blog.taglink = "{tag}/index.#{EXT}"

  blog.calendar_template = "articles.#{EXT}"
  blog.year_link = "{year}/index.#{EXT}"
  blog.month_link = "{year}/{month}/index.#{EXT}"
  blog.day_link = "{year}/{month}/{day}/index.#{EXT}"

  blog.generate_year_pages = false
  blog.generate_month_pages = false
  blog.generate_day_pages = false

  blog.paginate = true
  blog.per_page = 3
  blog.page_link = 'page/{num}'
end

activate :directory_indexes

activate :external_pipeline,
  command: "node_modules/.bin/gulp build#{MIN ? ' --min' : nil} --silent --wpk",
  name: :gulp,
  source: '.tmp'

configure :development do
  if build?
    # url_for('/blog/file.xhtml') or url_for(sitemap.resources[0])
    # Example: link(href="#{url_for('/css/style.css')}" rel='stylesheet')

    activate :relative_assets
    set :relative_links, true
    set :strip_index_file, false
  end
end

configure :production do
  activate :asset_hash
  activate :minify_html, remove_quotes: false, simple_boolean_attributes: false
end

ignore(/.*\.keep/)
ignore(/\.es6/)
ignore(/\.sass/)
ignore(%r{\.tag/.*})

set :build_dir, 'docs'
set :css_dir, 'css' if File.directory? 'src/css/'
set :fonts_dir, 'fonts' if File.directory? 'src/fonts/'
set :images_dir, 'img' if File.directory? 'src/img/'
set :js_dir, 'js' if File.directory? 'src/js/'
set :layouts_dir, '_layouts' if File.directory? 'src/_layouts/'
set :source, 'src' if File.directory? 'src/'

set :https, true
set :ssl_certificate, 'localhost.crt'
set :ssl_private_key, 'localhost.key'

set :index_file, "index.#{EXT}"
set :layout, 'layout'

set :slim,
  attr_quote: "'",
  format: EXT.to_sym,
  pretty: !MIN,
  sort_attrs: true,
  shortcut: {
    '@' => { attr: 'role' },
    '#' => { attr: 'id' },
    '.' => { attr: 'class' },
    '%' => { attr: 'itemprop' },
    '^' => { attr: 'data-is' },
    '&' => { attr: 'type', tag: 'input' }
  }
