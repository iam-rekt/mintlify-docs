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

type Route = "/" | "/quickstart" | "/guides/swap" | "/guides/liquidity" | "/guides/portfolio" | "/reference/contracts";
type NoteKind = "info" | "tip" | "warning";

const ROUTES: Route[] = ["/", "/quickstart", "/guides/swap", "/guides/liquidity", "/guides/portfolio", "/reference/contracts"];

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
    ],
  },
  {
    label: "Reference",
    links: [{ href: "/reference/contracts" as Route, label: "Contracts" }],
  },
] as const;

const SEARCH_ITEMS = [
  { href: "/quickstart" as Route, title: "First swap", text: "Connect a wallet, select tokens, read a quote, and confirm a Robinhood Chain swap." },
  { href: "/guides/swap" as Route, title: "Swap and bridge", text: "Expected output, minimum received, slippage, approvals, and cross-chain settlement." },
  { href: "/guides/liquidity" as Route, title: "V2 and V3 liquidity", text: "Create a pool, set a concentrated range, zap one token, migrate liquidity, and claim fees." },
  { href: "/guides/liquidity" as Route, title: "Single-token zap", text: "Deposit one token into a V3 position with protected internal routing." },
  { href: "/guides/liquidity" as Route, title: "Move existing liquidity", text: "Migrate compatible Uniswap V2 and V3 positions without a RobinSwap migration fee." },
  { href: "/guides/portfolio" as Route, title: "Portfolio", text: "Track V2 shares, V3 positions, ranges, fees, and activity." },
  { href: "/reference/contracts" as Route, title: "Contracts", text: "RobinSwap V2 and V3 deployment addresses on Robinhood Chain." },
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
  const active = path === "/guides/liquidity" ? 1 : path === "/guides/portfolio" || path === "/reference/contracts" ? 2 : 0;
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

function Steps({ items }: { items: { title: string; text: string }[] }) {
  return <ol className="steps">{items.map((item, index) => <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.title}</strong><p>{item.text}</p></div></li>)}</ol>;
}

function CardGrid({ items }: { items: { title: string; text: string; href?: Route }[] }) {
  return <div className="card-grid">{items.map((item) => item.href ? <Link href={item.href} key={item.title} className="doc-card"><strong>{item.title}</strong><p>{item.text}</p><Icon name="arrow" size={17} /></Link> : <div className="doc-card" key={item.title}><strong>{item.title}</strong><p>{item.text}</p></div>)}</div>;
}

function Figure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return <figure className="doc-figure"><img src={src} alt={alt} loading="lazy" /><figcaption>{caption}</figcaption></figure>;
}

function Overview() {
  return (
    <div className="overview">
      <section className="overview-hero">
        <div><p className="hero-kicker">RobinSwap field guide · Robinhood Chain</p><h1>Markets move.<br/><em>You stay oriented.</em></h1><span>Trade, provide liquidity, and track every position from one clear market interface.</span><div className="hero-actions"><Link href="/quickstart">Make a first swap <Icon name="arrow" size={16}/></Link><Link href="/guides/liquidity">Explore liquidity</Link></div></div>
        <div className="range-instrument" aria-label="Active V3 liquidity range illustration"><div className="range-caption"><span>Liquidity range</span><strong>Active</strong></div><div className="range-plot"><i className="range-axis"/><i className="range-active"/><i className="range-price"/></div><div className="range-labels"><span>Min</span><span>Market</span><span>Max</span></div></div>
      </section>
      <div className="guide-strip"><div><strong>Trade</strong><span>Local and cross-chain routes.</span></div><div><strong>Provide</strong><span>Balanced deposits or one token.</span></div><div><strong>Manage</strong><span>Ranges, fees, and activity.</span></div></div>
      <section className="overview-section"><div className="section-heading"><p>Choose a starting point</p><h2>Use the docs like the product.</h2></div><CardGrid items={[
        { title: "First swap", text: "Connect, read the quote, and confirm with confidence.", href: "/quickstart" },
        { title: "Swap and bridge", text: "Understand settlement, slippage, and approvals.", href: "/guides/swap" },
        { title: "Put assets to work", text: "Choose V2 or V3, set a range, zap, or migrate.", href: "/guides/liquidity" },
        { title: "Manage a position", text: "Edit ranges, zap out, and claim LP fees.", href: "/guides/portfolio" },
      ]}/></section>
      <section className="overview-section market-preview"><div className="section-heading"><p>See before you act</p><h2>Market context stays beside the action.</h2><span>Pool size, volume, fees, and the quote share one frame.</span></div><Figure src="/images/hero-1.png" alt="RobinSwap Trade page with market chart and swap card" caption="The current RobinSwap Trade view." /></section>
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
  const toc = [{ id: "styles", label: "Pool styles" }, { id: "create", label: "Create a position" }, { id: "zap", label: "Single-token zap" }, { id: "earn", label: "How LPs earn" }, { id: "adjust", label: "Adjust a range" }, { id: "migrate", label: "Move liquidity" }, { id: "claim", label: "Claim fees" }];
  return <Page eyebrow="Provide" title="Liquidity" description="Create, zap, migrate, and adjust RobinSwap liquidity positions." toc={toc}>
    <Figure src="/images/Liquidity.png" alt="RobinSwap liquidity directory" caption="Compare pool size, 24-hour flow, LP fees, estimated APR, and age." />
    <Section id="styles" title="Pick a pool style"><CardGrid items={[{ title: "V2 pools", text: "Deposit two assets at the current pool ratio. Liquidity remains active across the full price curve." }, { title: "V3 pools", text: "Choose a minimum and maximum price. The position earns while the market stays inside that range." }]}/><Note kind="tip">V2 is simpler to maintain. V3 offers more control, but a narrower range can move out of range sooner.</Note></Section>
    <Section id="create" title="Create a position"><Steps items={[
      { title: "Choose Add liquidity", text: "Select V2 or V3, then choose the token pair." },
      { title: "Set the starting point", text: "For a new pool, the first provider sets its initial price. Review it carefully." },
      { title: "Enter the deposit", text: "For a balanced position, enter one side and RobinSwap calculates the other from the pool and range." },
      { title: "Shape a V3 range", text: "Drag or type the bounds. Use chart zoom to inspect the surrounding market." },
      { title: "Approve and deposit", text: "Approve the required token amounts, then review the final wallet confirmation." },
    ]}/></Section>
    <Section id="zap" title="Single-token V3 deposit"><p>Choose <strong>One token</strong> to turn a single asset into a V3 position. RobinSwap quotes the internal swap, checks its estimated impact, and deposits both sides into the selected range.</p><p>The zap fee is <strong>0.15%</strong> of the zap value. The quote shows the estimated position amounts before you sign.</p><Note kind="warning">A zap is not a way around thin liquidity. Reduce the amount or widen the range if the protected quote cannot balance the position safely.</Note></Section>
    <Section id="earn" title="How liquidity earns"><p>Every swap pays the pool fee. V2 distributes fees by pool share. V3 distributes them only to positions whose range contains the current price.</p></Section>
    <Section id="adjust" title="Adjust a V3 range"><p>Open a position from Portfolio and choose <strong>Edit range</strong>. Pick new bounds and review the amounts. RobinSwap removes the old liquidity and creates the replacement position. Wallets with atomic batch support can submit the flow together; others may show separate confirmations.</p><p>An out-of-range position is held in one asset and no longer earns fees. Moving the range can put it back to work, but also changes the position’s exposure.</p><h3>Zap out</h3><p>Choose <strong>Zap out</strong> to remove a full V3 position, collect its fees, and receive one selected asset. Native ETH can be selected when the output is WETH.</p></Section>
    <Section id="migrate" title="Move existing liquidity"><p>Portfolio can detect compatible Uniswap V3 positions held by the connected wallet. Uniswap V2 LP tokens can be found by pair address.</p><p>Migration removes the source liquidity and deposits the available assets into the matching RobinSwap pool. RobinSwap charges no migration fee. Price protection can stop the transaction if the source and destination pools move too far apart.</p></Section>
    <Section id="claim" title="Claiming fees"><Steps items={[{ title: "Open a position", text: "Choose any position in Portfolio." }, { title: "Check unclaimed fees", text: "The position shows fees earned in each token since the previous claim." }, { title: "Collect", text: "Select Collect fees and confirm. The tokens return to the wallet." }]}/><Note>Use <strong>Claim all</strong> to collect from multiple eligible V3 positions in one action when supported.</Note></Section>
  </Page>;
}

function PortfolioGuide() {
  const toc = [{ id: "find", label: "What you’ll find" }, { id: "manage", label: "Manage V3" }, { id: "move", label: "Move liquidity" }];
  return <Page eyebrow="Manage" title="Portfolio" description="Track value, manage liquidity, claim fees, and review activity in one place." toc={toc}>
    <Figure src="/images/Portfolio.png" alt="RobinSwap portfolio" caption="Portfolio separates current value, position status, fees, activity, and migration tools." />
    <Section id="find" title="What you’ll find"><CardGrid items={[{ title: "Positions", text: "V2 pool shares and V3 position NFTs held by the connected wallet." }, { title: "Unclaimed fees", text: "Fees by position, plus Claim all when several positions are ready." }, { title: "Activity", text: "Recent indexed swaps and liquidity actions with explorer links." }]}/></Section>
    <Section id="manage" title="Managing V3 positions"><p>Open a V3 position to see its range, current price, and status.</p><div className="definition-list"><div><strong>In range</strong><span>Actively earning fees.</span></div><div><strong>Out of range</strong><span>Not earning and currently held in one asset.</span></div></div><p>From the position card, you can collect fees, edit the range, or zap out into one asset.</p></Section>
    <Section id="move" title="Bring liquidity over"><p>The migration panel finds compatible Uniswap V3 positions automatically and supports Uniswap V2 lookup by pair address. Migration has no RobinSwap migration fee and includes price-deviation protection.</p></Section>
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
    <Section id="tiers" title="V3 fee tiers"><div className="fee-tiers"><div><strong>0.01%</strong><span>Stable or pegged pairs</span></div><div><strong>0.05%</strong><span>Correlated pairs</span></div><div><strong>0.30%</strong><span>Standard pairs</span></div><div><strong>1.00%</strong><span>Exotic or volatile pairs</span></div></div></Section>
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
  if (path === "/reference/contracts") return <ContractsGuide />;
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
