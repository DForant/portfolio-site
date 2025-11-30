import { useState, useCallback } from 'react';

/**
 * Process tab data configuration
 * @type {Array<{id: string, number: string, label: string, title: string, description: string}>}
 */
const PROCESS_TABS = [
  {
    id: 'discover',
    number: '01',
    label: 'Discover',
    title: 'Discovery & Research',
    description: "We start by understanding your business, goals, target audience, and competitive landscape. Through detailed questionnaires and strategy sessions, I uncover what makes your brand unique and what your customers truly need.",
  },
  {
    id: 'define',
    number: '02',
    label: 'Define',
    title: 'Strategy & Planning',
    description: "Based on our discovery, I define your brand positioning, messaging hierarchy, and project scope. We'll establish clear objectives, map out a project schedule, and define success metrics to ensure we're building something that drives real business results.",
  },
  {
    id: 'design',
    number: '03',
    label: 'Design',
    title: 'Creative Development',
    description: "This is where the magic happens. I create visual concepts, iterate on designs, and develop your brand identity or website. Every design decision is strategic, purposeful, and aligned with your business goals.",
  },
  {
    id: 'develop',
    number: '04',
    label: 'Develop',
    title: 'Build & Implementation',
    description: "For web projects, I transform designs into functional, responsive websites. I focus on clean code, fast loading times, and seamless user experiences across all devices and browsers.",
  },
  {
    id: 'deploy',
    number: '05',
    label: 'Deploy',
    title: 'Launch & Optimization',
    description: "We launch your project with careful testing and optimization. I ensure everything works perfectly and provide you with the tools and knowledge to manage your new brand or website effectively.",
  },
  {
    id: 'debrief',
    number: '06',
    label: 'Debrief',
    title: 'Review & Support',
    description: "After launch, we review the project's performance and impact. I provide ongoing support, answer questions, and help you maximize the value of your investment in professional design.",
  },
];

/**
 * About component - About section with biography and process tabs
 * @returns {JSX.Element}
 */
function About() {
  const [activeTab, setActiveTab] = useState('discover');

  const handleTabClick = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleKeyDown = useCallback((e, tabId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabId);
    }
  }, []);

  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="section__container">
        <div className="about__grid">
          {/* Left Column: About Content */}
          <div className="about__content">
            <h2 id="about-title" className="section__title">
              From Code to Creative: A Developer's Approach to Brand & Web Design
            </h2>
            <p>
              Hi, I'm Dean. With over two decades of experience in web development, 
              I bring a unique technical foundation to the world of brand and web design. 
              My journey has given me an inside-out understanding of what makes a website 
              not just look good, but also perform flawlessly.
            </p>
            <p>
              Today, I channel that deep expertise into helping small local businesses tell 
              their story through compelling visual identities and professional websites. 
              My goal is to create a look and feel that you'll love and that will attract 
              more of your ideal customers.
            </p>
            <p>
              I believe great design is the perfect marriage of creativity and functionality. 
              It's about creating meaningful connections between your brand and your customers, 
              built on a rock-solid technical framework. Every project I take on is an opportunity 
              to help a business owner achieve their dreams with a brand that is both beautiful 
              and built to last.
            </p>
          </div>

          {/* Right Column: Process Tabs */}
          <div className="about__process">
            <h3>My Process</h3>

            {/* Tab Navigation */}
            <div className="process-tabs__nav">
              {PROCESS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  className={`process-tabs__tab${activeTab === tab.id ? ' process-tabs__tab--active' : ''}`}
                  data-tab={tab.id}
                  aria-selected={activeTab === tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  onKeyDown={(e) => handleKeyDown(e, tab.id)}
                >
                  <span className="process-tabs__number">{tab.number}</span>
                  <span className="process-tabs__label">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="process-tabs__content">
              {PROCESS_TABS.map((tab) => (
                <div
                  key={tab.id}
                  className={`process-tabs__panel${activeTab === tab.id ? ' process-tabs__panel--active' : ''}`}
                  data-panel={tab.id}
                >
                  <h4>{tab.title}</h4>
                  <p>{tab.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
