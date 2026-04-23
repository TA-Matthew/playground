import { Link } from 'react-router-dom'
import { projects } from '../data/projects'

export function HomePage() {
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <header className="mb-12 border-b border-stone-200 pb-10">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-800">
            Your UX playground
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-stone-900 md:text-4xl">
            Prototypes & study flows
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-stone-600">
            Open a project below to run a prototype.
          </p>
        </header>

        <section aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="sr-only">
            All projects
          </h2>
          <ul className="flex flex-col gap-4">
            {projects.map((project) => (
              <li key={project.id}>
                <Link
                  to={project.path}
                  className="group block rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-300/80 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <span className="text-lg font-medium text-stone-900 group-hover:text-emerald-900">
                        {project.title}
                      </span>
                      <p className="mt-1 text-[15px] leading-relaxed text-stone-600">
                        {project.description}
                      </p>
                    </div>
                    <span
                      className="mt-2 inline-flex shrink-0 items-center gap-1 text-sm font-medium text-emerald-700 sm:mt-0.5"
                      aria-hidden
                    >
                      Open
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        <path
                          d="M9 18l6-6-6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
