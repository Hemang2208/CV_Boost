import React from "react";
import { Link } from "react-router-dom";

const FutureResumeLanding = () => {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4 md:px-12 bg-white shadow-md">
        <div className="flex items-center">
          <img src="/api/placeholder/24/24" alt="logo" className="w-6 h-6" />
          <span className="ml-2 font-bold text-gray-800">FutureResume</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Sign in
          </Link>
          <Link to="/register" className="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600">
            Sign up
          </Link>
          <Link to="/jobs" className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Job List
          </Link>
          <Link to="/resumes" className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            My Resumes
          </Link>
          <Link to="/resumes/new" className="px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600">
            Create Resume
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 py-12 md:px-12 md:py-16">
        <div className="absolute top-0 right-0 opacity-20">
          <div className="w-20 h-20 bg-orange-200 rounded-full"></div>
        </div>
        <div className="absolute bottom-0 left-0 opacity-20">
          <div className="w-16 h-16 bg-orange-200 rounded-full"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="mb-4 text-4xl font-bold leading-tight">
              Create a <span className="text-orange-500">resume</span> that
              secures your <span className="text-orange-500">dream job</span>
            </h1>
            <p className="mb-6 text-gray-600">
              Build a resume that grabs the interest of recruiters and gets you
              hired. It's fast and easy to use.
            </p>
            <Link to="/register" className="px-6 py-3 text-white bg-orange-500 rounded-md hover:bg-orange-600">
              Try for free
            </Link>
          </div>
          <div className="md:w-2/5">
            <div className="p-2 bg-white rounded-lg shadow-lg">
              <img
                src="/api/placeholder/320/200"
                alt="Resume Editor Preview"
                className="w-full rounded-md border border-gray-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="px-4 py-12 bg-white md:px-12 md:py-16">
        <h2 className="mb-12 text-3xl font-bold text-center">
          Build your <span className="text-orange-500">resume</span> in 3 steps
        </h2>

        <div className="flex flex-col md:flex-row gap-8 justify-between">
          <div className="flex flex-col items-center text-center md:w-1/3">
            <div className="p-4 bg-orange-100 rounded-lg mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="Pick template"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">
              <span className="text-orange-500">1.</span> Pick a Template
            </h3>
            <p className="text-gray-600 text-sm">
              Choose from our professionally designed templates
            </p>
          </div>

          <div className="flex flex-col items-center text-center md:w-1/3">
            <div className="p-4 bg-orange-100 rounded-lg mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="Customize layout"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">
              <span className="text-orange-500">2.</span> Customize Your Layout
            </h3>
            <p className="text-gray-600 text-sm">
              Make it uniquely yours with our easy editor
            </p>
          </div>

          <div className="flex flex-col items-center text-center md:w-1/3">
            <div className="p-4 bg-orange-100 rounded-lg mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="HR Download"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">
              <span className="text-orange-500">3.</span> HR Download
            </h3>
            <p className="text-gray-600 text-sm">
              Get your ATS-friendly resume instantly
            </p>
          </div>
        </div>
      </section>

      {/* Editor Screenshot */}
      <section className="px-4 py-12 md:px-12 md:py-16 bg-orange-100">
        <h2 className="mb-6 text-2xl font-bold">
          Snapshot of our simple-to-use editor
        </h2>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <img
              src="/api/placeholder/400/320"
              alt="Editor Interface"
              className="w-full rounded-lg shadow-md"
            />
          </div>
          <div className="md:w-1/2">
            <p className="mb-4 text-gray-700">
              All the features & comfort you need to build a resume that stands
              out.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <div className="mt-1 mr-3 w-4 h-4 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-bold">Simple drag & drop interface</p>
                  <p className="text-sm text-gray-600">For quick creation</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mt-1 mr-3 w-4 h-4 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-bold">Readability / resume content</p>
                  <p className="text-sm text-gray-600">Get perfectly aligned</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="mt-1 mr-3 w-4 h-4 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="font-bold">Multiple layouts & templates</p>
                  <p className="text-sm text-gray-600">To choose from</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 flex gap-4">
              <Link to="/register" className="px-6 py-3 text-white bg-orange-500 rounded-md hover:bg-orange-600">
                Try for free
              </Link>
              <Link to="/jobs" className="px-6 py-3 text-orange-500 border border-orange-500 rounded-md hover:bg-orange-50">
                Browse Jobs
              </Link>
              <Link to="/resumes/new" className="px-6 py-3 text-orange-500 border border-orange-500 rounded-md hover:bg-orange-50">
                Create Resume
              </Link>
            </div>
            <div className="flex mt-6 gap-12">
              <div className="text-center">
                <p className="text-2xl font-bold">200+</p>
                <p className="text-sm text-gray-600">Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">3 mins</p>
                <p className="text-sm text-gray-600">
                  Average resume building time
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="px-4 py-12 md:px-12 md:py-16">
        <h2 className="mb-6 text-3xl font-bold">
          You can always pick
          <br />
          any template you like
        </h2>
        <p className="mb-8 text-orange-500 font-semibold">
          Choose from our beautiful designs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-2 bg-white rounded-lg shadow-md">
            <img
              src="/api/placeholder/320/400"
              alt="Resume Template"
              className="w-full rounded-md"
            />
          </div>
          <div className="p-2 bg-white rounded-lg shadow-md">
            <img
              src="/api/placeholder/320/400"
              alt="Resume Template"
              className="w-full rounded-md"
            />
          </div>
          <div className="p-2 bg-white rounded-lg shadow-md">
            <img
              src="/api/placeholder/320/400"
              alt="Resume Template"
              className="w-full rounded-md"
            />
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          Choose from one of our expertly prepared resume templates. All our
          templates have been reviewed by HR professionals across different
          industries, reflecting what recruiters want to see most. Additionally,
          you can edit it to your personal preferences and once done, hit "PDF
          Download". Even if you have never created a resume before, it's that
          simple to use!
        </p>
      </section>

      {/* About Section */}
      <section className="px-4 py-12 md:px-12 md:py-16 bg-gray-100">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <h2 className="mb-6 text-3xl font-bold">About FutureResume</h2>
            <p className="mb-6 text-gray-600">
              Future Resume is a product of FutureHire – a global company in
              digital HR training industry. From Resume building to career
              development, our tools are designed to help job seekers get the
              best out of their career journey. With more than 7 years of
              dedicated research and work with job hiring experts to help
              job-their career out better. We want you to stand out amidst the
              fierce competition. Be special. Be unique. With our designs and
              templates, we make sure you exceed the expectations. Our
              resume-format checker creates immaculate first impressions that
              directly communicates your skills.
            </p>
            <button className="px-6 py-3 text-white bg-orange-500 rounded-md hover:bg-orange-600">
              Learn more
            </button>
          </div>
          <div className="md:w-1/2">
            <img
              src="/api/placeholder/400/300"
              alt="Team working"
              className="w-full rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-12 md:px-12 md:py-16">
        <h2 className="mb-3 text-3xl font-bold text-center">
          Benefits Of Using Our Product
        </h2>
        <p className="mb-12 text-orange-500 font-semibold text-center">
          Why Choose Us?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="Easy to use"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">Easy to use</h3>
            <p className="text-gray-600">
              Our intuitive, user-friendly interface helps you quickly build
              your resume
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="Secure"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">Secure</h3>
            <p className="text-gray-600">
              Your information is kept secure and private in our system
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="Templates"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">Cool Templates</h3>
            <p className="text-gray-600">
              Choose from our wide range of professional resume templates
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="Intelligent Design"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">Intelligent Design</h3>
            <p className="text-gray-600">
              We'll help you with smart suggestions about the best format
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="HR-Approved"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">
              HR-Approved & ATS-Friendly
            </h3>
            <p className="text-gray-600">
              Our resume designs are reviewed by HR experts and optimized for
              ATS
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <img
                src="/api/placeholder/80/80"
                alt="No Hidden Charges"
                className="w-20 h-20"
              />
            </div>
            <h3 className="mb-2 text-xl font-bold">No Hidden Charges</h3>
            <p className="text-gray-600">
              Transparent pricing with no hidden fees. Only pay for what you
              need
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-4 py-12 md:px-12 md:py-16 bg-orange-50 relative">
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-orange-100"></div>
        <h2 className="mb-3 text-3xl font-bold">
          Testimonials From
          <br />
          Our Previous Users
        </h2>
        <p className="mb-12 text-orange-500 font-semibold">
          What People Say About Us
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <img
                src="/api/placeholder/48/48"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-4">
                <h4 className="font-bold">Peter Iha</h4>
                <p className="text-sm text-gray-600">UX Designer</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "The resume tool allowed me to present my findings in a way that
              highlighted my strengths and ultimately led to me securing my
              dream job."
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <img
                src="/api/placeholder/48/48"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-4">
                <h4 className="font-bold">Abraham Udoumoh</h4>
                <p className="text-sm text-gray-600">Software Engineer</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "With this new resume format, more companies across all sizes
              started to reach out. I can confidently say that the tool had a
              great impact on my job search process."
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <img
                src="/api/placeholder/48/48"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
              <div className="ml-4">
                <h4 className="font-bold">Naomi Adeyoju</h4>
                <p className="text-sm text-gray-600">Data Analyst</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "I was stuck on how to continue my career evolution after being
              redundant with many years of experience. The tool helped me to
              organize and refactor my resume. I landed a job as a senior
              analyst with my new resume!"
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 bg-gray-900 text-white md:px-12">
        <div className="flex flex-col md:flex-row justify-between mb-12">
          <div className="mb-8 md:mb-0">
            <h3 className="mb-4 text-xl font-bold">Future Resume</h3>
            <p className="mb-4 text-gray-300">
              Create your winning CV today with our expert tools and tips.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-300 hover:text-white">
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
              </a>
              <a href="#" className="text-gray-300 hover:text-white">
                <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
              </a>
            </div>
          </div>

          <div className="mb-8 md:mb-0">
            <h4 className="mb-4 text-lg font-bold">Terms & Policies</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-8 md:mb-0">
            <h4 className="mb-4 text-lg font-bold">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-bold">Contact</h4>
            <p className="text-gray-300">+1 (234) 567-8901</p>
            <p className="text-gray-300">support@futureresume.com</p>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>Copyright © FutureResume 2025. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
};

export default FutureResumeLanding;
