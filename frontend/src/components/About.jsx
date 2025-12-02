import { useState } from 'react';

const defaultProcessSteps = [
  {
    id: 'discover',
    number: '01',
    label: 'Discover',
    title: 'Discovery & Research',
    description:
      "We start by understanding your business, goals, target audience, and competitive landscape. Through detailed questionnaires and strategy sessions, I uncover what makes your brand unique and what your customers truly need.",
  },
  {
    id: 'define',
    number: '02',
    label: 'Define',
    title: 'Strategy & Planning',
    description:
      "Based on our discovery, I define your brand positioning, messaging hierarchy, and project scope. We'll establish clear objectives, map out a project schedule, and define success metrics to ensure we're building something that drives real business results.",
  },
  {
    id: 'design',
    number: '03',
    label: 'Design',
    title: 'Creative Development',
    description:
      'This is where the magic happens. I create visual concepts, iterate on designs, and develop your brand identity or website. Every design decision is strategic, purposeful, and aligned with your business goals.',
  },
  {
    id: 'develop',
    number: '04',
    label: 'Develop',
    title: 'Build & Implementation',
    description:
      'For web projects, I transform designs into functional, responsive websites. I focus on clean code, fast loading times, and seamless user experiences across all devices and browsers.',
  },
  {
    id: 'deploy',
    number: '05',
    label: 'Deploy',
    title: 'Launch & Optimization',
    description:
      'We launch your project with careful testing and optimization. I ensure everything works perfectly and provide you with the tools and knowledge to manage your new brand or website effectively.',
  },
  {
    id: 'debrief',
    number: '06',
    label: 'Debrief',
    title: 'Review & Support',
    description:
      "After launch, we review the project's performance and impact. I provide ongoing support, answer questions, and help you maximize the value of your investment in professional design.",
  },
];

/**
 * About component - About section with process tabs
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.paragraphs - Array of about paragraphs
 * @param {Array} props.processSteps - Array of process steps
 */
function About({
  title = "From Code to Creative: A Developer's Approach to Brand & Web Design",
  paragraphs = [
    "Hi, I'm Dean. With over two decades of experience in web development, I bring a unique technical foundation to the world of brand and web design. My journey has given me an inside-out understanding of what makes a website not just look good, but also perform flawlessly.",
    "Today, I channel that deep expertise into helping small local businesses tell their story through compelling visual identities and professional websites. My goal is to create a look and feel that you'll love and that will attract more of your ideal customers.",
    "I believe great design is the perfect marriage of creativity and functionality. It's about creating meaningful connections between your brand and your customers, built on a rock-solid technical framework. Every project I take on is an opportunity to help a business owner achieve their dreams with a brand that is both beautiful and built to last.",
  ],
  processSteps = defaultProcessSteps,
}) {
  const [activeTab, setActiveTab] = useState(processSteps[0]?.id || 'discover');

  const handleTabClick = (e, tabId) => {
    e.preventDefault();
    setActiveTab(tabId);
  };

  const handleKeyDown = (e, tabId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabId);
    }
  };

  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="section__container">
        <div className="about__grid">
          {/* Left Column: About Content */}
          <div className="about__content">
            <h2 id="about-title" className="section__title">
              {title}
            </h2>
            {paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Right Column: Process Tabs */}
          <div className="about__process">
            <h3>My Process</h3>

            {/* Tab Navigation */}
            <div className="process-tabs__nav">
              {processSteps.map((step) => (
                <button
                  key={step.id}
                  className={`process-tabs__tab${activeTab === step.id ? ' process-tabs__tab--active' : ''}`}
                  data-tab={step.id}
                  aria-selected={activeTab === step.id}
                  onClick={(e) => handleTabClick(e, step.id)}
                  onKeyDown={(e) => handleKeyDown(e, step.id)}
                >
                  <span className="process-tabs__number">{step.number}</span>
                  <span className="process-tabs__label">{step.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="process-tabs__content">
              {processSteps.map((step) => (
                <div
                  key={step.id}
                  className={`process-tabs__panel${activeTab === step.id ? ' process-tabs__panel--active' : ''}`}
                  data-panel={step.id}
                >
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
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
