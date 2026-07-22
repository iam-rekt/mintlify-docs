import {
  createContext,
  type KeyboardEvent,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Route = "/" | "/quickstart" | "/guides/swap" | "/guides/liquidity" | "/guides/portfolio" | "/guides/website-widget" | "/reference/contracts" | "/find-us";
type NoteKind = "info" | "tip" | "warning";

const ROUTES: Route[] = ["/", "/quickstart", "/guides/swap", "/guides/liquidity", "/guides/portfolio", "/guides/website-widget", "/reference/contracts", "/find-us"];

const NAV_GROUPS = [
  {
    label: "Start here",
    links: [
      { href: "/" as Route, label: "Overview" },
      { href: "/quickstart" as Route, label: "First swap" },
    ],
  },
  {
    label: "Use RobinSwap",
    links: [
      { href: "/guides/swap" as Route, label: "Swap and bridge" },
      { href: "/guides/liquidity" as Route, label: "Liquidity" },
      { href: "/guides/portfolio" as Route, label: "Portfolio" },
      { href: "/guides/website-widget" as Route, label: "Website widget" },
    ],
  },
  {
    label: "Reference",
    links: [
      { href: "/reference/contracts" as Route, label: "Contracts" },
      { href: "/find-us" as Route, label: "Find us" },
    ],
  },
] as const;

const SEARCH_ITEMS = [
  { href: "/quickstart" as Route, title: "First swap", text: "Connect a wallet, select tokens, read a quote, and confirm a Robinhood Chain swap." },
  { href: "/guides/swap" as Route, title: "Swap and bridge", text: "Expected output, minimum received, slippage, approvals, and cross-chain settlement." },
  { href: "/guides/liquidity" as Route, title: "V2 and V3 liquidity", text: "Create a pool, set a concentrated range, zap one token, migrate liquidity, and claim fees." },
  { href: "/guides/liquidity" as Route, title: "Single-token zap", text: "Deposit one token into a V3 position with protected internal routing." },
  { href: "/guides/liquidity" as Route, title: "Add to a position", text: "Increase an existing V3 position at its current fee tier and earning range." },
  { href: "/guides/liquidity" as Route, title: "Reduce or withdraw liquidity", text: "Withdraw part or all of a V3 position directly into both pool tokens." },
  { href: "/guides/liquidity" as Route, title: "Adjust a liquidity range", text: "Move V3 bounds with the range chart and preview the new position before signing." },
  { href: "/guides/liquidity" as Route, title: "Move existing liquidity", text: "Migrate compatible Uniswap V2 and V3 positions without a RobinSwap migration fee." },
  { href: "/guides/liquidity" as Route, title: "Migrate a fee tier", text: "Move a RobinSwap V3 position into a different pool fee tier and range." },
  { href: "/guides/portfolio" as Route, title: "Portfolio", text: "Track V2 shares, V3 positions, ranges, fees, and activity." },
  { href: "/guides/website-widget" as Route, title: "Website widget", text: "Install the hosted swap widget, customize its surface, and connect wallets." },
  { href: "/reference/contracts" as Route, title: "Contracts", text: "RobinSwap V2 and V3 deployment addresses on Robinhood Chain." },
  { href: "/find-us" as Route, title: "Find us", text: "Official RobinSwap community, analytics, portfolio, and market pages." },
];

const NavigationContext = createContext<(route: Route) => void>(() => undefined);

function Icon({ name, size = 18 }: { name: "arrow" | "search" | "sun" | "moon" | "menu" | "close" | "external" | "check"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.7-3.7"/></svg>;
  if (name === "sun") return <svg {...common}><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>;
  if (name === "moon") return <svg {...common}><path d="M20.5 15.4A8.5 8.5 0 0 1 8.6 3.5a8.5 8.5 0 1 0 11.9 11.9Z"/></svg>;
  if (name === "menu") return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  if (name === "external") return <svg {...common}><path d="M14 5h5v5M19 5l-8 8"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>;
  if (name === "check") return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
  return <svg {...common}><path d="M5 12h14M14 7l5 5-5 5"/></svg>;
}

function Link({ href, children, className, onClick }: PropsWithChildren<{ href: Route; className?: string; onClick?: () => void }>) {
  const navigate = useContext(NavigationContext);
  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        navigate(href);
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

function RobinSwapLogo() {
  return (
    <div className="brand-lockup">
      <img src="/logo/light.svg" className="brand-logo brand-logo-light" alt="" />
      <img src="/logo/dark.svg" className="brand-logo brand-logo-dark" alt="" />
      <div><strong>RobinSwap</strong><span>Documentation</span></div>
    </div>
  );
}

function Sidebar({ path, open, close }: { path: Route; open: boolean; close: () => void }) {
  return (
    <>
      <button className={`sidebar-scrim ${open ? "is-open" : ""}`} aria-label="Close navigation" onClick={close} />
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-head">
          <Link href="/" onClick={close}><RobinSwapLogo /></Link>
          <button className="icon-button sidebar-close" aria-label="Close navigation" onClick={close}><Icon name="close" /></button>
        </div>
        <nav aria-label="Documentation">
          {NAV_GROUPS.map((group) => (
            <section className="nav-group" key={group.label}>
              <p>{group.label}</p>
              {group.links.map((link) => (
                <Link key={link.href} href={link.href} onClick={close} className={path === link.href ? "active" : ""}>
                  <span>{link.label}</span><span className="nav-mark" />
                </Link>
              ))}
            </section>
          ))}
        </nav>
        <div className="sidebar-foot">
          <a href="https://www.robinswap.finance" target="_blank" rel="noreferrer">Open RobinSwap <Icon name="external" size={15} /></a>
          <span>Robinhood Chain · 4663</span>
        </div>
      </aside>
    </>
  );
}

function SearchDialog({ open, close }: { open: boolean; close: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setQuery("");
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);
  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return SEARCH_ITEMS;
    return SEARCH_ITEMS.filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(value));
  }, [query]);
  if (!open) return null;
  return (
    <div className="search-layer" role="dialog" aria-modal="true" aria-label="Search documentation" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div className="search-dialog">
        <div className="search-input-wrap"><Icon name="search" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search RobinSwap docs" /><kbd>esc</kbd></div>
        <div className="search-results">
          {results.length ? results.map((item) => (
            <Link href={item.href} key={`${item.href}-${item.title}`} onClick={close}>
              <span><strong>{item.title}</strong><small>{item.text}</small></span><Icon name="arrow" size={16} />
            </Link>
          )) : <div className="search-empty"><strong>No match found</strong><span>Try “zap”, “range”, “bridge”, or “contracts”.</span></div>}
        </div>
      </div>
    </div>
  );
}

function Topbar({ dark, toggleTheme, openMenu, openSearch }: { dark: boolean; toggleTheme: () => void; openMenu: () => void; openSearch: () => void }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" aria-label="Open navigation" onClick={openMenu}><Icon name="menu" /></button>
      <div className="mobile-brand"><Link href="/"><RobinSwapLogo /></Link></div>
      <button className="search-button" onClick={openSearch}><Icon name="search" size={16} /><span>Search documentation</span><kbd>⌘K</kbd></button>
      <div className="topbar-actions">
        <button className="icon-button" aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={toggleTheme}><Icon name={dark ? "sun" : "moon"} /></button>
        <a className="app-button" href="https://www.robinswap.finance" target="_blank" rel="noreferrer">Open app <Icon name="external" size={15} /></a>
      </div>
    </header>
  );
}

function MarketRail({ path }: { path: Route }) {
  const active = path === "/guides/liquidity" ? 1 : path === "/guides/portfolio" || path === "/reference/contracts" || path === "/find-us" ? 2 : 0;
  return (
    <div className="market-rail" aria-label="Documentation journey">
      {["Trade", "Provide", "Manage"].map((label, index) => <div key={label} className={index <= active ? "active" : ""}><span>{label}</span><i /></div>)}
    </div>
  );
}

function Page({ eyebrow, title, description, toc, children }: PropsWithChildren<{ eyebrow: string; title: string; description: string; toc?: { id: string; label: string }[] }>) {
  return (
    <div className="page-grid">
      <article className="doc-page">
        <header className="page-header"><p>{eyebrow}</p><h1>{title}</h1><span>{description}</span></header>
        {children}
      </article>
      {toc?.length ? <aside className="toc"><p>On this page</p>{toc.map((item) => <a key={item.id} href={`#${item.id}`}>{item.label}</a>)}</aside> : null}
    </div>
  );
}

function Section({ id, title, children }: PropsWithChildren<{ id: string; title: string }>) {
  return <section id={id} className="doc-section"><h2>{title}</h2>{children}</section>;
}

function Note({ kind = "info", children }: PropsWithChildren<{ kind?: NoteKind }>) {
  return <div className={`note ${kind}`}><span className="note-symbol">{kind === "warning" ? "!" : kind === "tip" ? "↗" : "i"}</span><div>{children}</div></div>;
}

function CodeBlock({ children }: PropsWithChildren) {
  return <pre className="code-block"><code>{children}</code></pre>;
}

function Steps({ items }: { items: { title: string; text: string }[] }) {
  return <ol className="steps">{items.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></li>)}</ol>;
}

function CardGrid({ items }: { items: { title: string; text: string; href?: Route }[] }) {
  return <div className="card-grid">{items.map((item) => item.href ? <Link href={item.href} key={item.title} className="doc-card"><strong>{item.title}</strong><p>{item.text}</p><Icon name="arrow" size={17} /></Link> : <div className="doc-card" key={item.title}><strong>{item.title}</strong><p>{item.text}</p></div>)}</div>;
}

function Figure({ src, darkSrc, alt, caption, className = "" }: { src: string; darkSrc?: string; alt: string; caption: string; className?: string }) {
  return <figure className={`doc-figure ${className}`.trim()}>
    <img className={darkSrc ? "figure-light" : undefined} src={src} alt={alt} loading="lazy" />
    {darkSrc ? <img className="figure-dark" src={darkSrc} alt={alt} loading="lazy" /> : null}
    <figcaption>{caption}</figcaption>
  </figure>;
}

function VideoFigure({ src, poster, caption }: { src: string; poster: string; caption: string }) {
  return <figure className="doc-figure doc-video">
    <video controls autoPlay loop muted playsInline poster={poster} aria-label={caption}><source src={src} type="video/mp4" /></video>
    <figcaption>{caption}</figcaption>
  </figure>;
}

function VisualStep({ number, title, text, src, alt, caption }: { number: string; title: string; text: string; src: string; alt: string; caption: string }) {
  return <div className="visual-step">
    <div className="visual-step-copy"><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></div>
    <Figure src={src} alt={alt} caption={caption} className="walkthrough-figure" />
  </div>;
}

function Overview() {
  return (
    <div className="overview">
      <section className="overview-hero">
        <div><p className="hero-kicker">Welcome to RobinSwap</p><h1>Your guide to<br/><em>RobinSwap.</em></h1><span>Learn how to trade, provide liquidity, and manage positions on Robinhood Chain with clear, visual walkthroughs.</span><div className="hero-actions"><Link href="/quickstart">Make a first swap <Icon name="arrow" size={16}/></Link><Link href="/guides/liquidity">Manage liquidity</Link></div></div>
        <div className="home-path" aria-label="RobinSwap documentation paths">
          <div><span>01</span><strong>Trade</strong><small>Read the quote and its protection.</small></div>
          <div><span>02</span><strong>Provide</strong><small>Choose a pool, fee, and range.</small></div>
          <div><span>03</span><strong>Manage</strong><small>Add, withdraw, adjust, and claim.</small></div>
        </div>
      </section>
      <section className="overview-section"><div className="section-heading"><p>Choose a task</p><h2>Go directly to the action.</h2></div><CardGrid items={[
        { title: "First swap", text: "Connect, read the quote, and confirm with confidence.", href: "/quickstart" },
        { title: "Swap and bridge", text: "Understand settlement, slippage, and approvals.", href: "/guides/swap" },
        { title: "Provide liquidity", text: "Choose V2 or V3, set a range, zap, or migrate.", href: "/guides/liquidity" },
        { title: "Manage a position", text: "Add, withdraw, edit ranges, and claim LP fees.", href: "/guides/portfolio" },
      ]}/></section>
      <section className="overview-section market-preview"><div className="section-heading"><p>Visual walkthroughs</p><h2>The interface, explained in context.</h2><span>Each guide uses the real product so labels, ranges, and confirmations are easy to recognize when you act.</span><Link href="/guides/liquidity" className="inline-guide-link">Open the liquidity walkthrough <Icon name="arrow" size={15}/></Link></div><Figure src="/images/range-editor-detail.png" alt="RobinSwap V3 range editor" caption="Adjust a V3 range against the live pool view before confirming." /></section>
    </div>
  );
}

function Quickstart() {
  const toc = [{ id: "before", label: "Before you start" }, { id: "swap", label: "Make the swap" }, { id: "after", label: "After confirmation" }];
  return <Page eyebrow="Start here" title="Your first swap" description="Connect a wallet, read the quote, and make a swap on Robinhood Chain." toc={toc}>
    <Section id="before" title="Before you start"><Note>Keep a small amount of ETH for gas. If your assets are on another supported network, the same swap flow can route them into Robinhood Chain.</Note></Section>
    <Section id="swap" title="Make the swap"><Steps items={[
      { title: "Open RobinSwap", text: "Go to robinswap.finance and select Connect wallet. Confirm the connection in your wallet." },
      { title: "Choose the network", text: "Use Robinhood Chain for a local swap. For a cross-chain swap, choose the source network in the trade card." },
      { title: "Pick the tokens", text: "Choose what you are selling, enter an amount, then select what you want to receive. You can search by contract address." },
      { title: "Read the quote", text: "Check the expected output, minimum received, price impact, and selected route." },
      { title: "Approve and swap", text: "Approve an ERC-20 token when required, then confirm the swap. Native ETH does not require approval." },
    ]}/><Figure src="/images/hero-1.png" alt="RobinSwap trade interface" caption="Live market context and the active quote stay together." /></Section>
    <Section id="after" title="After confirmation"><p>A local swap finishes after its Robinhood Chain transaction confirms. A cross-chain swap remains pending until the destination transfer settles.</p><CardGrid items={[{ title: "Understand every quote", text: "Learn minimum received, slippage, approvals, and route settlement.", href: "/guides/swap" }, { title: "Explore pools", text: "Compare liquidity, flow, fees, APR, and pool age.", href: "/guides/liquidity" }]}/></Section>
  </Page>;
}

function SwapGuide() {
  const toc = [{ id: "quote", label: "Reading a quote" }, { id: "slippage", label: "Slippage" }, { id: "approvals", label: "Approvals" }, { id: "settlement", label: "Settlement" }, { id: "troubleshooting", label: "Troubleshooting" }];
  return <Page eyebrow="Trade" title="Swap and bridge" description="Understand RobinSwap quotes, local execution, and cross-chain settlement." toc={toc}>
    <Figure src="/images/hero-1.png" alt="RobinSwap swap interface" caption="The swap card shows the current quote and minimum received before confirmation." />
    <Section id="quote" title="Reading a quote"><p>Every quote shows the numbers that define the trade before you sign.</p><div className="definition-list">
      <div><strong>Expected output</strong><span>The estimated amount received at current prices.</span></div>
      <div><strong>Minimum received</strong><span>The lowest output permitted by your slippage setting.</span></div>
      <div><strong>Price impact</strong><span>How much this trade changes the pool price.</span></div>
      <div><strong>Route</strong><span>Where the swap executes and how a cross-chain transfer reaches Robinhood Chain.</span></div>
      <div><strong>Network fee</strong><span>Gas paid on the network where you sign.</span></div>
    </div></Section>
    <Section id="slippage" title="Slippage and quote freshness"><p>Slippage is the price movement you allow between quote and execution. A tight setting protects the output but can make a moving trade fail. RobinSwap refreshes the quote automatically; review it again if the route or minimum received changes.</p></Section>
    <Section id="approvals" title="Approvals"><p>An ERC-20 token needs an approval before the selected router can use it. Native ETH does not. Your wallet shows an approval separately from the swap transaction.</p></Section>
    <Section id="settlement" title="Local and cross-chain settlement"><CardGrid items={[{ title: "Local swap", text: "Confirm the trade and wait for its Robinhood Chain transaction." }, { title: "Cross-chain swap", text: "The card tracks the source transaction, pending transfer, destination submission, and completion." }]}/><Note>Do not submit the same cross-chain trade again because the destination balance has not arrived yet. Check the active route status and source transaction first.</Note></Section>
    <Section id="troubleshooting" title="Troubleshooting"><div className="definition-list"><div><strong>Transaction failed</strong><span>Increase slippage slightly, check gas, or reduce the amount.</span></div><div><strong>No route found</strong><span>Try a smaller amount, a common asset such as ETH, or another source network.</span></div><div><strong>Quote keeps changing</strong><span>Pool and bridge conditions moved. Review the newest minimum before confirming.</span></div></div></Section>
  </Page>;
}

function LiquidityGuide() {
  const toc = [{ id: "styles", label: "Pool styles" }, { id: "create", label: "Create a position" }, { id: "zap", label: "Single-token zap" }, { id: "add", label: "Add to a position" }, { id: "withdraw", label: "Reduce or withdraw" }, { id: "adjust", label: "Adjust a range" }, { id: "earn", label: "How LPs earn" }, { id: "migrate", label: "Move liquidity" }, { id: "tier", label: "Migrate fee tier" }, { id: "claim", label: "Claim fees" }];
  return <Page eyebrow="Provide" title="Liquidity" description="Create a position, then add, withdraw, or reshape it with clear previews." toc={toc}>
    <Figure src="/images/Liquidity.png" alt="RobinSwap liquidity directory" caption="Compare pool size, 24-hour flow, LP fees, estimated APR, and age." />
    <Section id="styles" title="Pick a pool style"><CardGrid items={[{ title: "V2 pools", text: "Deposit two assets at the current pool ratio. Liquidity remains active across the full price curve." }, { title: "V3 pools", text: "Choose a minimum and maximum price. The position earns while the market stays inside that range." }]}/><Note kind="tip">V2 is simpler to maintain. V3 offers more control, but a narrower range can move out of range sooner.</Note></Section>
    <Section id="create" title="Create a position"><Steps items={[
      { title: "Choose Add liquidity", text: "Select V2 or V3, then choose the token pair." },
      { title: "Set the starting point", text: "For a new pool, the first provider sets its initial price. Review it carefully." },
      { title: "Enter the deposit", text: "For a balanced position, enter one side and RobinSwap calculates the other from the pool and range." },
      { title: "Shape a V3 range", text: "Drag or type the bounds. Use chart zoom to inspect the surrounding market." },
      { title: "Approve and deposit", text: "Approve the required token amounts, then review the final wallet confirmation." },
    ]}/><Figure src="/images/create-liquidity.png" alt="RobinSwap choose how to provide panel" caption="Choose V2 or V3, balanced tokens or a one-token zap, then select the pool fee." className="product-panel" /></Section>
    <Section id="zap" title="Single-token V3 deposit"><p>Choose <strong>One token</strong> to turn a single asset into a V3 position. RobinSwap quotes the internal swap, checks its estimated impact, and deposits both sides into the selected range.</p><Note kind="warning">A zap is not a way around thin liquidity. Reduce the amount or widen the range if the protected quote cannot balance the position safely.</Note></Section>
    <Section id="add" title="Add to an existing position"><VisualStep number="01" title="Keep the same range" text="Open a V3 position in Portfolio, choose Add / remove, and stay on Add liquidity. Enter either token or use Max; the second amount follows the position’s live ratio." src="/images/manage-add.png" alt="RobinSwap add liquidity to an existing V3 position" caption="Balances and Max are shown for both tokens before the position is increased." /></Section>
    <Section id="withdraw" title="Reduce or withdraw"><VisualStep number="02" title="Choose how much to remove" text="Switch to Reduce / withdraw, select 25%, 50%, 75%, or Full, then review the estimated principal. A direct withdrawal returns both pool tokens and does not perform a zap." src="/images/manage-withdraw.png" alt="RobinSwap reduce or withdraw liquidity panel" caption="A full withdrawal returns both pool assets and collects available position fees." /><h3>Receive one token instead</h3><p>Choose <strong>Zap out</strong> when you want a full V3 position converted into one selected asset. Native ETH can be selected when the output is WETH.</p></Section>
    <Section id="adjust" title="Adjust a V3 range"><VisualStep number="03" title="Move the earning bounds" text="Choose Edit range, drag the handles or enter new prices, and use pool-view zoom to keep the surrounding ticks visible. Review the market price and new bounds before confirming." src="/images/range-editor-detail.png" alt="RobinSwap edit liquidity range chart" caption="The shaded band is the new earning range; the market marker shows where the current pool price sits." /><p>RobinSwap removes the old liquidity and creates the replacement position. Wallets with atomic batch support can submit the flow together; others may show separate confirmations.</p><p>An out-of-range position is held in one asset and no longer earns fees. Moving the range can put it back to work, but also changes the position’s exposure.</p></Section>
    <Section id="earn" title="How liquidity earns"><p>Every swap pays the pool fee. V2 distributes fees by pool share. V3 distributes them only to positions whose range contains the current price.</p></Section>
    <Section id="migrate" title="Move existing liquidity"><p>Portfolio can detect compatible Uniswap V3 positions held by the connected wallet. Uniswap V2 LP tokens can be found by pair address.</p><p>Migration removes the source liquidity and deposits the available assets into the matching RobinSwap pool. The RobinSwap <strong>migration fee is none</strong>; the wallet still pays network gas. Price protection can stop the transaction if the source and destination pools move too far apart.</p><VideoFigure src="/images/liquidity-migration-actions.mp4" poster="/images/liquidity-migration-actions.png" caption="Fee Tier and Migrate are separate entry points; hover movement swaps the Uniswap mark into RobinSwap." /></Section>
    <Section id="tier" title="Migrate a pool fee tier"><p>Choose <strong>Fee Tier</strong> on Liquidity, or open <strong>Range / tier</strong> from a V3 position in Portfolio. Select a different destination tier and either keep a full range or set new bounds.</p><p>RobinSwap withdraws the source position, initializes the destination pool when necessary, and mints a replacement NFT. After confirmation it verifies the new owner, pair, fee tier, range, and liquidity before reporting success.</p><div className="fee-tiers fee-tiers-five"><div><strong>0.01%</strong><span>Available tier</span></div><div><strong>0.05%</strong><span>Available tier</span></div><div><strong>0.25%</strong><span>Available tier</span></div><div><strong>0.30%</strong><span>Available tier</span></div><div><strong>1.00%</strong><span>Available tier</span></div></div><Note>A fee-tier migration creates a replacement NFT. Review the destination tier and range before confirming.</Note></Section>
    <Section id="claim" title="Claiming fees"><Steps items={[{ title: "Open a position", text: "Choose any position in Portfolio." }, { title: "Check unclaimed fees", text: "The position shows fees earned in each token since the previous claim." }, { title: "Collect", text: "Select Collect fees and confirm. The tokens return to the wallet." }]}/><Note>Use <strong>Claim all</strong> to collect from multiple eligible V3 positions in one action when supported.</Note></Section>
  </Page>;
}

function PortfolioGuide() {
  const toc = [{ id: "find", label: "What you’ll find" }, { id: "manage", label: "Manage V3" }, { id: "move", label: "Move liquidity" }];
  return <Page eyebrow="Manage" title="Portfolio" description="Track value, manage liquidity, claim fees, and review activity in one place." toc={toc}>
    <Figure src="/images/portfolio-overview-light.png" darkSrc="/images/portfolio-overview-dark.png" alt="RobinSwap liquidity portfolio overview" caption="Portfolio summarizes priced value, active positions, earning status, and each position’s share of capital." className="wide-product" />
    <Section id="find" title="What you’ll find"><CardGrid items={[{ title: "Positions", text: "V2 pool shares and V3 position NFTs held by the connected wallet." }, { title: "Unclaimed fees", text: "Fees by position, plus Claim all when several positions are ready." }, { title: "Activity", text: "Recent indexed swaps and liquidity actions with explorer links." }]}/></Section>
    <Section id="manage" title="Managing V3 positions"><p>Open a V3 position to see its range, current price, and status.</p><div className="definition-list"><div><strong>In range</strong><span>Actively earning fees.</span></div><div><strong>Out of range</strong><span>Not earning and currently held in one asset.</span></div></div><p>From the position card, you can add liquidity, withdraw part or all of the position, edit its range, collect fees, or zap out into one asset.</p><CardGrid items={[{ title: "Add or withdraw", text: "See balances, Max, partial withdrawal controls, and direct two-token exits.", href: "/guides/liquidity" }, { title: "Edit the earning range", text: "Use the range chart, bounds, and pool-view zoom before confirming.", href: "/guides/liquidity" }]}/></Section>
    <Section id="move" title="Bring liquidity over"><p>The migration panel finds compatible Uniswap V3 positions automatically and supports Uniswap V2 lookup by pair address. The RobinSwap migration fee is none, and price-deviation protection applies.</p><p>Use <strong>Fee Tier</strong> to move a RobinSwap V3 position into a different tier. The flow can initialize a missing destination pool and creates a replacement NFT whose owner, tier, range, and liquidity are verified after confirmation.</p></Section>
  </Page>;
}

function WebsiteWidgetGuide() {
  const toc = [{ id: "install", label: "Install" }, { id: "customize", label: "Customize" }, { id: "attributes", label: "Attributes" }, { id: "wallet", label: "Wallet connection" }];
  const install = `<div id="robinswap-widget"></div>

<script
  src="https://www.robinswap.finance/robinswap-widget.js"
  data-container="#robinswap-widget"
  data-theme="dark"
  data-max-width="520"
  data-height="760">
</script>`;
  const customize = `<script
  src="https://www.robinswap.finance/robinswap-widget.js"
  data-container="#robinswap-widget"
  data-background="#ffffe0"
  data-box-color="#fffef7"
  data-text-color="#10211b"
  data-button-color="#82c900"
  data-radius="18"
  data-max-width="560">
</script>`;
  const attributes = [
    ["data-container", "CSS selector for the host element. Defaults to #robinswap-widget."],
    ["data-theme", "light or dark. Omit it to follow the visitor's system theme or the custom background."],
    ["data-background", "Six-digit hex color for the widget canvas."],
    ["data-box-color", "Six-digit hex color for the network and swap panels."],
    ["data-text-color", "Six-digit hex color for primary text, including the header and footer."],
    ["data-button-color", "Six-digit hex color for the main Swap or Connect wallet button."],
    ["data-from-chain", "Initial source chain ID. The destination remains Robinhood Chain."],
    ["data-token-in", "Initial input token contract address."],
    ["data-token-out", "Initial output token contract address."],
    ["data-amount", "Initial amount in the input token's normal decimal format, such as 25.5."],
    ["data-max-width", "Widget width in pixels, clamped from 320 to 960. It still contracts on smaller screens."],
    ["data-height", "Starting height in pixels, clamped from 560 to 1200."],
    ["data-radius", "Outer corner radius in pixels, clamped from 0 to 40."],
    ["data-loading", "Set to eager to load immediately. Otherwise the iframe uses lazy loading."],
  ];
  return <Page eyebrow="Integrate" title="Website widget" description="Add RobinSwap to a website and match it to your layout." toc={toc}>
    <p className="widget-value-line">Give users the best available swap price across the Robinhood Chain ecosystem without making them leave your site.</p>
    <div className="widget-preview-grid"><Figure src="/images/website-widget-preview.png" alt="RobinSwap website widget with a live ETH to USDG quote" caption="The complete quote and wallet flow stay inside the responsive widget." /><Figure src="/images/website-widget-token-selector.png" alt="RobinSwap widget token selector" caption="Token selection remains contained on narrow embeds." /></div>
    <Section id="install" title="Install the widget"><p>Add a container where the widget should appear, then load the RobinSwap script.</p><CodeBlock>{install}</CodeBlock><p>The container uses the available width while the widget respects <code>data-max-width</code>. Place it inside the same responsive column or card used by the rest of the page.</p></Section>
    <Section id="customize" title="Customize the surface"><p>Set a complete palette directly on the script.</p><CodeBlock>{customize}</CodeBlock><p>If <code>data-text-color</code> is omitted, RobinSwap selects readable light or dark text from the background. Button text adjusts automatically. The RobinSwap name and iframe title remain fixed.</p></Section>
    <Section id="attributes" title="Available attributes"><div className="definition-list widget-attributes">{attributes.map(([name, detail]) => <div key={name}><strong><code>{name}</code></strong><span>{detail}</span></div>)}</div><Note>Token values must be valid addresses for the selected source chain. <code>data-amount</code> is the amount the user initially pays and can be changed inside the widget.</Note></Section>
    <Section id="wallet" title="Wallet connection"><p>The widget contains RobinSwap's wallet setup, so the host website does not install Wagmi or pass a provider into the iframe. <strong>Connect wallet</strong> opens the RobinSwap wallet chooser, including WalletConnect and compatible browser wallets.</p><p>Some extensions choose not to expose an injected wallet inside a cross-origin iframe. In that case, use WalletConnect or select <strong>Open RobinSwap</strong>.</p></Section>
  </Page>;
}

const contracts = {
  v2: [
    ["Factory", "0xa95DA9b9fCef09A07F99444fE9304457d6ECdccA"],
    ["Router", "0x673E66027a2F01D224E82a0f81e082d6EFe0527C"],
  ],
  v3: [
    ["Factory", "0xea561e058313b96011e5070ca7d0f027a44e3748"],
    ["Swap Router", "0x7BeF1E8C941310B457FEA16F860E42dBF62EC9bE"],
    ["Position Manager", "0xd359160448B011dC1AAAF9C166e2e13bb414e6b3"],
    ["Quoter", "0x3C83eF839884118a3Acf29FD18cB393EF9D429f9"],
  ],
  assets: [["Wrapped ETH", "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73"]],
};

function ContractTable({ rows }: { rows: string[][] }) {
  return <div className="contract-table">{rows.map(([name, address]) => <div key={address}><strong>{name}</strong><code>{address}</code><a href={`https://robinhoodchain.blockscout.com/address/${address}`} target="_blank" rel="noreferrer" aria-label={`Open ${name} on Blockscout`}><Icon name="external" size={15}/></a></div>)}</div>;
}

function ContractsGuide() {
  const toc = [{ id: "network", label: "Network" }, { id: "v2", label: "V2 contracts" }, { id: "v3", label: "V3 contracts" }, { id: "assets", label: "Assets" }, { id: "tiers", label: "V3 fee tiers" }];
  return <Page eyebrow="Reference" title="Contracts" description="RobinSwap contracts used by the current app on Robinhood Chain." toc={toc}>
    <Section id="network" title="Network"><div className="network-card"><div><span>Network</span><strong>Robinhood Chain</strong></div><div><span>Chain ID</span><strong>4663</strong></div><div><span>Native token</span><strong>ETH</strong></div></div></Section>
    <Section id="v2" title="V2"><ContractTable rows={contracts.v2}/></Section>
    <Section id="v3" title="V3"><ContractTable rows={contracts.v3}/></Section>
    <Section id="assets" title="Wrapped native asset"><ContractTable rows={contracts.assets}/></Section>
    <Section id="tiers" title="V3 fee tiers"><div className="fee-tiers fee-tiers-five"><div><strong>0.01%</strong><span>Stable or pegged pairs</span></div><div><strong>0.05%</strong><span>Correlated pairs</span></div><div><strong>0.25%</strong><span>General-purpose pairs</span></div><div><strong>0.30%</strong><span>Standard pairs</span></div><div><strong>1.00%</strong><span>Exotic or volatile pairs</span></div></div></Section>
  </Page>;
}

const officialLinks = [
  { code: "X", name: "X", detail: "Announcements and product updates", href: "https://x.com/RobinSwap_" },
  { code: "TG", name: "Telegram", detail: "Official RobinSwap community", href: "https://t.me/RobinSwap_Official" },
  { code: "DL", name: "DefiLlama", detail: "Protocol TVL and tracked metrics", href: "https://defillama.com/protocol/robinswap" },
  { code: "DB", name: "DeBank", detail: "RobinSwap protocol positions and activity", href: "https://debank.com/protocols/hood_robinswap" },
  { code: "DX", name: "Dexscreener", detail: "Live Robinhood Chain pools and trades", href: "https://dexscreener.com/robinhood/robinswap" },
];

function FindUsGuide() {
  return <Page eyebrow="Official links" title="Find us" description="Follow RobinSwap, join the community, or inspect live protocol activity.">
    <div className="official-directory">
      {officialLinks.map((item) => <a key={item.name} href={item.href} target="_blank" rel="noreferrer" className="official-link">
        <span className="official-code">{item.code}</span>
        <span className="official-copy"><strong>{item.name}</strong><small>{item.detail}</small></span>
        <Icon name="external" size={16}/>
      </a>)}
    </div>
  </Page>;
}

function NotFound() {
  return <div className="not-found"><span>404</span><h1>This page isn’t in the field guide.</h1><p>Use the navigation or return to the overview.</p><Link href="/">Return to overview <Icon name="arrow" size={16}/></Link></div>;
}

function RouteContent({ path }: { path: string }) {
  if (path === "/") return <Overview />;
  if (path === "/quickstart") return <Quickstart />;
  if (path === "/guides/swap") return <SwapGuide />;
  if (path === "/guides/liquidity") return <LiquidityGuide />;
  if (path === "/guides/portfolio") return <PortfolioGuide />;
  if (path === "/guides/website-widget") return <WebsiteWidgetGuide />;
  if (path === "/reference/contracts") return <ContractsGuide />;
  if (path === "/find-us") return <FindUsGuide />;
  return <NotFound />;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname.replace(/\/$/, "") || "/");
  const [dark, setDark] = useState(() => localStorage.getItem("robinswap-docs-theme") === "dark" || (!localStorage.getItem("robinswap-docs-theme") && window.matchMedia("(prefers-color-scheme: dark)").matches));
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("robinswap-docs-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname.replace(/\/$/, "") || "/");
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "/" && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); setSearchOpen(true); }
      if (event.key === "Escape") { setSearchOpen(false); setMenuOpen(false); }
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => { window.removeEventListener("popstate", onPopState); window.removeEventListener("keydown", onKeyDown); };
  }, []);

  const navigate = (route: Route) => {
    if (route !== path) window.history.pushState({}, "", route);
    setPath(route);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const currentRoute = ROUTES.includes(path as Route) ? path as Route : "/";
  return (
    <NavigationContext.Provider value={navigate}>
      <div className="docs-shell">
        <Sidebar path={currentRoute} open={menuOpen} close={() => setMenuOpen(false)} />
        <div className="docs-main">
          <Topbar dark={dark} toggleTheme={() => setDark((value) => !value)} openMenu={() => setMenuOpen(true)} openSearch={() => setSearchOpen(true)} />
          <MarketRail path={currentRoute} />
          <main><RouteContent path={path} /></main>
          <footer><RobinSwapLogo /><span>Built for Robinhood Chain</span><a href="https://www.robinswap.finance" target="_blank" rel="noreferrer">Open app <Icon name="external" size={14}/></a></footer>
        </div>
      </div>
      <SearchDialog open={searchOpen} close={() => setSearchOpen(false)} />
    </NavigationContext.Provider>
  );
}
