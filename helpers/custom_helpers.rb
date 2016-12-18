module CustomHelpers
  def article(article, content)
    partial '_parts/article', locals: {
      article: article,
      content: content,
      single: is_blog_article?
    }
  end

  def inline_tag(tag, *files)
    content_tag tag.to_sym do
      content = '/*<![CDATA[*/ '
      files.map do |file|
        content << sitemap.find_resource_by_path(file).render
      end
      content << ' /*]]>*/'
      content
    end
  end

  def page_intro
    if current_page.methods.include? :slug
      if File.exist?("src/_parts/_#{current_page.slug}.slim")
        partial "_parts/#{current_page.slug}"
      end
    elsif !!current_page.locals['tagname']
      if File.exist?("src/_parts/_#{current_page.locals['tagname']}.slim")
        partial "_parts/#{current_page.locals['tagname']}"
      end
    end
  end

  def page_title
    site_name = 'ptb2.me'
    if is_blog_article?
      "#{current_page.title} - #{site_name}"
    else
      d = Date.new(current_page.locals['year'] || 1, current_page.locals['month'] || 1, current_page.locals['day'] || 1)
      case current_page.locals['page_type']
      when 'day'
        "#{site_name} for #{d.strftime('%B')} #{d.strftime('%e').to_i.ordinalize}, #{d.strftime('%Y')}"
      when 'month'
        "#{site_name} for #{d.strftime('%B')} #{d.strftime('%Y')}"
      when 'year'
        "#{site_name} for #{d.strftime('%Y')}"
      when 'tag'
        "#{current_page.locals['tagname'].titleize} - #{site_name}"
      else
        "Welcome to #{site_name}"
      end
    end
  end

  def pagination
    if is_blog_article?
      partial '_parts/pagination', locals: {
        prev_pg: current_page.next_article,
        next_pg: current_page.previous_article,
        page_num: nil,
        total_pg: nil,
        single: true
      }
    else
      partial '_parts/pagination', locals: {
        prev_pg: current_page.locals['prev_page'],
        next_pg: current_page.locals['next_page'],
        page_num: current_page.locals['page_number'],
        total_pg: current_page.locals['num_pages'],
        single: false
      }
    end
  end
end
