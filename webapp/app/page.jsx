import Link from 'next/link'
import StorySection from '../components/StorySection'

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="container hero-split">
          <div className="hero-text">
            <h1 style={{ fontSize: '5rem', lineHeight: '1.05', marginBottom: '2rem' }}>
              Sharing our journey,<br />
              <span style={{ color: 'var(--color-purple)' }}>to simplify yours.</span>
            </h1>
            <h2 style={{ 
              fontSize: '2rem', 
              fontFamily: 'var(--font-heading)', 
              color: 'var(--color-golden)', 
              marginBottom: '1rem',
              fontWeight: 600
            }}>
              This site is everything we wish we knew, all in one place.
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '3rem', color: 'var(--color-text)', lineHeight: 1.8, maxWidth: '650px' }}>
              Explore our <Link href="/blog" style={{ display: 'inline-block', backgroundColor: 'var(--color-golden)', color: 'white', padding: '2px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', margin: '0 4px', textTransform: 'uppercase' }}>blog</Link> for tips, recommendations, and honest insights. Browse our curated <Link href="/gallery" style={{ display: 'inline-block', backgroundColor: 'var(--color-purple)', color: 'white', padding: '2px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', margin: '0 4px', textTransform: 'uppercase' }}>travel gallery</Link> for visual inspiration and highlights of our journeys. 
              <br /><br />
              Or, if you are feeling overwhelmed and want help structuring your journey sustainably, we offer 1-on-1 strategy calls to help you curate your own unforgettable route.
            </p>
            <div className="hero-btns" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/start-planning" className="btn btn-primary">Start Planning</Link>
              <Link href="/gallery" className="btn btn-secondary">Gallery</Link>
            </div>
          </div>
          <div className="hero-visuals">
            <img src="/assets/hj-cottonwood.jpg" alt="Couple traveling" className="blob-shape-1" />
            <img src="/assets/rice-terraces.jpg" alt="Temple" className="blob-shape-2" />
          </div>
        </div>
      </header>

      <section className="social-proof">
        <p>Trusted by weary planners looking for a better way to travel</p>
      </section>

      <StorySection isExcerpt={true} />

      <section style={{ backgroundColor: 'var(--color-purple)', color: 'white', borderRadius: '80px 80px 0 0', padding: '100px 24px', overflow: 'hidden' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          
          {/* Section Header */}
          <div style={{ textAlign: 'center', marginBottom: '100px' }}>
            <span style={{
              textTransform: 'uppercase',
              letterSpacing: '2px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--color-golden)',
              display: 'block',
              marginBottom: '12px'
            }}>
              Free Companion Tool
            </span>
            <h2 style={{ fontSize: '3.2rem', color: 'white', margin: '0 0 20px', fontFamily: 'var(--font-heading)', lineHeight: 1.1 }}>
              Your Travel. Past, future and present - all in one place.
            </h2>
            <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', margin: '0 0 30px' }}>
              Wherever your travels take you, turn your footprints into Tracks.
            </p>
            <Link href="/tracker" className="btn btn-primary" style={{
              backgroundColor: 'var(--color-golden)',
              color: 'var(--color-purple)',
              padding: '16px 36px',
              fontSize: '1.1rem',
              fontWeight: 800,
              borderRadius: '30px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 10px 25px rgba(232, 180, 100, 0.2)'
            }}>
              🚀 Start Travelin'
            </Link>
          </div>

          {/* Interactive Walkthrough Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '140px' }}>
            
            {/* Step 1: Dashboard */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '60px', 
              alignItems: 'center', 
              flexWrap: 'wrap'
            }}>
              {/* Left Column: Large Image with floating annotations */}
              <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center', position: 'relative', padding: '20px' }}>
                <div style={{ width: '320px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', border: '6px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  <img src="/assets/screenshot_dashboard.png" alt="Dashboard" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  
                  {/* Circle Overlay: Daily average metrics */}
                  <div style={{
                    position: 'absolute',
                    top: '12%',
                    left: '52%',
                    width: '130px',
                    height: '60px',
                    border: '3px dashed var(--color-orange)',
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    transform: 'rotate(-4deg)'
                  }} />
                  
                  {/* Circle Overlay: Category Breakdown grid */}
                  <div style={{
                    position: 'absolute',
                    top: '25%',
                    left: '3%',
                    width: '300px',
                    height: '160px',
                    border: '3px dashed var(--color-orange)',
                    borderRadius: '24px',
                    pointerEvents: 'none',
                    transform: 'rotate(2deg)'
                  }} />
                </div>

                {/* Floating Pointer Card 1 */}
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  right: '-30px',
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                  width: '180px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  zIndex: 2,
                  border: '1.5px solid var(--color-orange)'
                }}>
                  <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px' }}>💵 Daily Target Sync</strong>
                  Daily averages update live to let you know exactly what is left of your budget.
                </div>

                {/* Floating Pointer Card 2 */}
                <div style={{
                  position: 'absolute',
                  bottom: '30px',
                  left: '-40px',
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                  width: '200px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  zIndex: 2,
                  border: '1.5px solid var(--color-orange)'
                }}>
                  <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px' }}>🏠 Categorized Pacing</strong>
                  Accommodation, transit, food, and miscellaneous costs calculated automatically.
                </div>
              </div>

              {/* Right Column: Descriptions */}
              <div style={{ flex: '1 1 380px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-golden)', textTransform: 'uppercase', letterSpacing: '1px' }}>01 / Dashboard</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: '8px 0 16px', lineHeight: '1.2' }}>
                  Remember where you went. Stay on top of what you spent.
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', margin: '0 0 20px' }}>
                  Keep track of all travel elements in one place. Log locations, budgets, and notes without background process drain.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>📍</span> <strong>Daily pacing</strong>: Track spends at your active destination (e.g. Kuta).
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>🏠</span> <strong>Category breakdown</strong>: Accommodation, Transportation, and Food separated out.
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>💵</span> <strong>Daily averages</strong>: See how today's spending compares to your overall target.
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2: Log Expense */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row-reverse', 
              gap: '60px', 
              alignItems: 'center', 
              flexWrap: 'wrap'
            }}>
              {/* Right Column (Visual): Image with floating annotations */}
              <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center', position: 'relative', padding: '20px' }}>
                <div style={{ width: '320px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', border: '6px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  <img src="/assets/screenshot_log_expense.png" alt="Log Expense" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  
                  {/* Circle Overlay: Conversion rates */}
                  <div style={{
                    position: 'absolute',
                    top: '37%',
                    left: '6%',
                    width: '280px',
                    height: '70px',
                    border: '3px dashed var(--color-orange)',
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    transform: 'rotate(-2deg)'
                  }} />

                  {/* Circle Overlay: Worth It star toggle */}
                  <div style={{
                    position: 'absolute',
                    top: '55%',
                    left: '50%',
                    width: '140px',
                    height: '50px',
                    border: '3px dashed var(--color-orange)',
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    transform: 'rotate(4deg)'
                  }} />
                </div>

                {/* Floating Pointer Card 1 */}
                <div style={{
                  position: 'absolute',
                  top: '25%',
                  left: '-40px',
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                  width: '190px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  zIndex: 2,
                  border: '1.5px solid var(--color-orange)'
                }}>
                  <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px' }}>🔄 Instant FX Math</strong>
                  Type local currency (Rp 50,000) and watch it convert to USD ($2.76) in real-time.
                </div>

                {/* Floating Pointer Card 2 */}
                <div style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '-30px',
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                  width: '180px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  zIndex: 2,
                  border: '1.5px solid var(--color-orange)'
                }}>
                  <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px' }}>🌟 Was it "Worth It"?</strong>
                  Tag items you love! Helps track value beyond raw cost matrices.
                </div>
              </div>

              {/* Left Column (Copy) */}
              <div style={{ flex: '1 1 380px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-golden)', textTransform: 'uppercase', letterSpacing: '1px' }}>02 / Log Expense</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: '8px 0 16px', lineHeight: '1.2' }}>
                  Create new entries in 10s or less.
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', margin: '0 0 20px' }}>
                  Enter local pricing completely offline. Tag your purchases dynamically with custom hashtags and worth-it indicators.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>🌟</span> <strong>"Worth it" check</strong>: Quickly mark when an experience or meal was genuinely worth the cost.
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>🔄</span> <strong>Auto conversion</strong>: Type 50,000 Rp and watch it convert to USD ($2.76) instantly.
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>#️⃣</span> <strong>Frequent hashtags</strong>: Tap quick tags (#coffee, #dinner, #snacks) to log instantly.
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3: Plan */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row', 
              gap: '60px', 
              alignItems: 'center', 
              flexWrap: 'wrap'
            }}>
              {/* Left Column (Visual): Image with floating annotations */}
              <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center', position: 'relative', padding: '20px' }}>
                <div style={{ width: '320px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', border: '6px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  <img src="/assets/screenshot_plan.png" alt="Plan" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  
                  {/* Circle Overlay: Lombok chronological tracking */}
                  <div style={{
                    position: 'absolute',
                    top: '25%',
                    left: '5%',
                    width: '280px',
                    height: '240px',
                    border: '3px dashed var(--color-orange)',
                    borderRadius: '24px',
                    pointerEvents: 'none',
                    transform: 'rotate(-1deg)'
                  }} />
                </div>

                {/* Floating Pointer Card 1 */}
                <div style={{
                  position: 'absolute',
                  top: '10%',
                  right: '-40px',
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                  width: '190px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  zIndex: 2,
                  border: '1.5px solid var(--color-orange)'
                }}>
                  <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px' }}>📅 Flexible Timeline</strong>
                  Check what has been spent on historical dates or estimate what is ahead.
                </div>

                {/* Floating Pointer Card 2 */}
                <div style={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '-40px',
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                  width: '190px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  zIndex: 2,
                  border: '1.5px solid var(--color-orange)'
                }}>
                  <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px' }}>📝 Notes & Reminders</strong>
                  Log specific addresses, checkout times, and sights right on your timeline.
                </div>
              </div>

              {/* Right Column (Copy) */}
              <div style={{ flex: '1 1 380px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-golden)', textTransform: 'uppercase', letterSpacing: '1px' }}>03 / Forward Planning</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: '8px 0 16px', lineHeight: '1.2' }}>
                  Stay flexible by planning your forward-looking itinerary.
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', margin: '0 0 20px' }}>
                  Map out your travel targets and pacing days in advance without rigid itinerary constraints.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>📅</span> <strong>Calendar timeline</strong>: Chronological view of where you are going (Lombok, Gili, Flores).
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>📝</span> <strong>Todo lists & notes</strong>: Attach custom reminders, sights, or todo checklists per day.
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>💰</span> <strong>Future estimations</strong>: Forecast spends to see total projected trip expenses.
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4: History Search */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'row-reverse', 
              gap: '60px', 
              alignItems: 'center', 
              flexWrap: 'wrap'
            }}>
              {/* Right Column (Visual): Image with floating annotations */}
              <div style={{ flex: '1 1 320px', display: 'flex', justifyContent: 'center', position: 'relative', padding: '20px' }}>
                <div style={{ width: '320px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.4)', border: '6px solid rgba(255,255,255,0.08)', position: 'relative' }}>
                  <img src="/assets/screenshot_history.png" alt="History Search" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  
                  {/* Circle Overlay: Search queries */}
                  <div style={{
                    position: 'absolute',
                    top: '51%',
                    left: '5%',
                    width: '290px',
                    height: '60px',
                    border: '3px dashed var(--color-orange)',
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    transform: 'rotate(2deg)'
                  }} />
                </div>

                {/* Floating Pointer Card 1 */}
                <div style={{
                  position: 'absolute',
                  top: '30%',
                  left: '-40px',
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                  width: '180px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  zIndex: 2,
                  border: '1.5px solid var(--color-orange)'
                }}>
                  <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px' }}>🔍 Search Filtering</strong>
                  Find specific past transaction costs instantly by name or tag.
                </div>

                {/* Floating Pointer Card 2 */}
                <div style={{
                  position: 'absolute',
                  bottom: '35%',
                  right: '-40px',
                  backgroundColor: 'white',
                  color: 'var(--color-purple)',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.25)',
                  width: '190px',
                  fontSize: '0.85rem',
                  lineHeight: '1.4',
                  zIndex: 2,
                  border: '1.5px solid var(--color-orange)'
                }}>
                  <strong style={{ display: 'block', color: 'var(--color-orange)', marginBottom: '3px' }}>✈️ Dynamic Log Retrieval</strong>
                  Recall addresses, flight times, and reference logs on demand.
                </div>
              </div>

              {/* Left Column (Copy) */}
              <div style={{ flex: '1 1 380px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-golden)', textTransform: 'uppercase', letterSpacing: '1px' }}>04 / History Search</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: '8px 0 16px', lineHeight: '1.2' }}>
                  Fast search & instant cost retrieval.
                </h3>
                <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.85)', lineHeight: '1.6', margin: '0 0 20px' }}>
                  Query through past transactions easily to pull up travel details or share references with friends.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>🔍</span> <strong>Instant lookup</strong>: Search keywords like "Flight" to filter matches in milliseconds.
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>✈️</span> <strong>Historical details</strong>: Quickly recall flight numbers, checkin times, or stay addresses.
                  </li>
                  <li style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.92rem', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: 'var(--color-golden)' }}>📊</span> <strong>Spreadsheet view</strong>: Inspect full trip details or export transaction logs in one tap.
                  </li>
                </ul>
              </div>
            </div>

          </div>

        </div>
      </section>

      <section className="conversion-section" style={{ backgroundColor: 'var(--color-purple)', padding: '100px 24px', textAlign: 'center', color: 'white' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)', color: 'white' }}>
            Want Help Building Your Own Route?
          </h2>
          <p style={{ fontSize: '1.25rem', marginBottom: '1.5rem', opacity: 0.9 }}>
            Planning long-term travel can get overwhelming fast. If you need help structuring your trip sustainably, avoiding burnout, and making confident route decisions...
          </p>
          <p style={{ fontSize: '1.25rem', marginBottom: '2.5rem', opacity: 0.9 }}>
            …we offer custom strategy calls based on the exact systems we use to travel full-time.
          </p>
          <Link href="/start-planning" className="btn btn-primary" style={{ backgroundColor: 'white', color: 'var(--color-purple)', padding: '16px 32px', fontSize: '1.2rem' }}>
            Learn More Here
          </Link>
        </div>
      </section>
    </>
  )
}
