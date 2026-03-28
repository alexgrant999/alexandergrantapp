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
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button
            onClick={() => setFilter('')}
            style={{
              background: !filter ? '#6c63ff' : '#1e1e2e',
              color: !filter ? '#fff' : '#6b6b8a',
              border: 'none',
              padding: '5px 14px',
              borderRadius: '8px',
              fontSize: '.78rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setFilter(tag === filter ? '' : tag)}
              style={{
                background: filter === tag ? '#6c63ff' : '#1e1e2e',
                color: filter === tag ? '#fff' : '#6b6b8a',
                border: 'none',
                padding: '5px 14px',
                borderRadius: '8px',
                fontSize: '.78rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.length === 0 && (
          <p style={{ color: '#6b6b8a', textAlign: 'center', padding: '40px 0' }}>
            No resources yet. Be the first to share one!
          </p>
        )}

        {filtered.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  const domain = new URL(resource.url).hostname.replace('www.', '')
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        background: '#16161f',
        border: '1px solid #1e1e2e',
        borderRadius: '14px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        transition: 'transform .2s, border-color .2s, box-shadow .2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'rgba(108,99,255,.4)'
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.3)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.borderColor = '#1e1e2e'
        e.currentTarget.style.boxShadow = ''
      }}
    >
      {resource.image && (
        <div style={{ width: '100%', height: '160px', overflow: 'hidden', position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resource.image}
            alt={resource.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #16161f 100%)' }} />
        </div>
      )}

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={faviconUrl}
            alt=""
            width={20}
            height={20}
            style={{ borderRadius: '4px', marginTop: '2px', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{resource.title}</h3>
              <span style={{ color: '#6c63ff', fontSize: '.8rem', flexShrink: 0 }}>↗</span>
            </div>
            <p style={{ color: '#6b6b8a', fontSize: '.78rem' }}>{domain}</p>
          </div>
        </div>

        {resource.description ? (
          <p style={{ color: '#a0a0b8', fontSize: '.88rem', lineHeight: 1.6, marginTop: '10px' }}>
            {resource.description}
          </p>
        ) : (
          <p style={{ color: '#3a3a55', fontSize: '.85rem', fontStyle: 'italic', marginTop: '10px' }}>
            AI description generating...
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {resource.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: 'rgba(108,99,255,.12)',
                  color: 'rgba(180,175,255,.8)',
                  fontSize: '.72rem',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          {resource.submittedBy && (
            <span style={{ color: '#6b6b8a', fontSize: '.75rem' }}>
              by {resource.submittedBy}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}
