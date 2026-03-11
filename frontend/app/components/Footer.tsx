export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-logo">
          <img src="/logo.svg" alt="RuCraft" width={314} height={87} />
        </div>
        <div className="site-footer-content">
          <div className="site-footer-text">
            <div>наш сайт вконтакте честное слово сами делали</div>
            <div className="site-footer-link-row">
              <a href="https://vk.com/ru_craft" target="_blank" rel="noopener noreferrer">https://vk.com/ru_craft</a>
              <a href="https://vk.ru/1ntagee" className="site-footer-vk" aria-label="ВКонтакте" target="_blank" rel="noopener noreferrer">
                <img src="/vk.png" alt="ВКонтакте" width={315} height={91} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
