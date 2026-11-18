'use client'

import { useState } from 'react'

interface Resource {
  id: string
  url: string
  title: string
  description: string | null
  image: string | null
  submittedBy: string | null
  tags: string[]
  createdAt: string | Date
}

export function ResourceList({ initialResources }: { initialResources: Resource[] }) {
  const [filter, setFilter] = useState('')

  const allTags = [...new Set(initialResources.flatMap((r) => r.tags))]

  const filtered = initialResources.filter((r) => {
    if (!filter) return true
    return r.tags.includes(filter)
  })

  return (
    <>
      {allTags.length > 0 && (
        <div className="rs-filters">
          <button type="button" className="rs-filter" aria-pressed={!filter} onClick={() => setFilter('')}>All</button>
          {allTags.map((tag) => (
            <button key={tag} type="button" className="rs-filter" aria-pressed={filter === tag} onClick={() => setFilter(tag === filter ? '' : tag)}>
              {tag}
            </button>
          ))}
        </div>
      )}

      <ul className="rs-list">
        {filtered.length === 0 && <li className="rs-empty">Nothing here yet. Share the first link.</li>}
        {filtered.map((resource) => <ResourceRow key={resource.id} resource={resource} />)}
      </ul>
    </>
  )
}

function ResourceRow({ resource }: { resource: Resource }) {
  const domain = new URL(resource.url).hostname.replace('www.', '')
  const meta = [resource.tags.join(', '), resource.submittedBy && `shared by ${resource.submittedBy}`].filter(Boolean).join(' · ')

  return (
    <li className="rs-item">
      <div>
        <h2>
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            {resource.title}<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </h2>
        <span className="rs-domain">{domain}</span>
        <p className="rs-desc">{resource.description ?? 'A description is on its way.'}</p>
        {meta && <p className="rs-meta">{meta}</p>}
      </div>
      {resource.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="rs-thumb" src={resource.image} alt="" loading="lazy" onError={(e) => { e.currentTarget.hidden = true }} />
      )}
    </li>
  )
}
