/* eslint no-console: off */

import fs from 'fs'
import { Observable } from 'rxjs/Observable'
import superagent from 'superagent'
import {
  curry,
  flatten,
  map,
  merge,
  pipe,
  prop,
  propOr,
  reverse,
  sortBy,
  uniqBy,
} from 'ramda'

import secrets from '../secrets'

const cacheFile = '../feedcache.json'
let cache = []

const on = curry((f: Function, g: Function, a: any, b: any) => f(g(a))(g(b)))

const writeFile = Observable.bindNodeCallback(fs.writeFile)
const readFile = Observable.bindNodeCallback(fs.readFile)

const request = curry((a, b) => {
  const method = propOr('get', 'method', b)
  const headers = on(merge, propOr({}, 'headers'), a, b)
  const data = on(merge, propOr({}, 'data'), a, b)
  const url = /^https?:\/\//.test(b.url) ? b.url : a.url.concat(b.url)
  const r = superagent(method, url).set(headers)
  return Observable.defer(prop(method, {
    get: () => r.query(data),
    post: () => r.send(data),
  })).map(x => prop('body', x))
})

const gitlab = request({
  url: 'https://gitlab.com/api/v4/',
  headers: {
    'PRIVATE-TOKEN': secrets.gitlab.key,
  },
})

const github = request({
  url: 'https://api.github.com/',
  headers: {
    Authorization: `token ${secrets.github.key}`,
  },
})

const seconds = d => new Date(d).getTime()

const gitlabRepos = () => {
  const publicProjects = (page: number) =>
    gitlab({
      url: `users/${secrets.gitlab.user}/projects`,
      data: { page, visibility: 'public' },
    }).do(x => console.log(`fetched ${x.length} public projects from gitlab`))
  return publicProjects(1)
    .merge(publicProjects(2))
    .reduce((p, c) => p.concat(c), [])
    .map(map(x => ({
      url: x.web_url,
      name: x.name,
      description: x.description,
      updated: seconds(x.last_activity_at),
      data: {
        stars: x.star_count,
        issues: x.open_issues_count,
        forks: x.forks_count,
      },
    })))
}

const githubRepos = () =>
  github({
    url: 'search/repositories',
    data: { q: 'user:DanielFGray fork:false' },
    headers: {
      Accept: 'application/vnd.github.mercy-preview+json',
    },
  })
    .map(x => prop('items', x))
    .do(x => console.log(`fetched ${x.length} public projects from github`))
    .map(map(x => ({
      url: x.html_url,
      name: x.name,
      description: x.description,
      updated: seconds(x.updated_at),
      data: {
        language: x.language,
        stars: x.stargazers_count,
        issues: x.open_issues_count,
        forks: x.forks,
      },
    })))

const getRepos = () =>
  Observable.of([])
    .do(() => console.log('updating repolist cache'))
    .combineLatest(githubRepos(), gitlabRepos())
    .map(pipe(
      flatten,
      uniqBy(prop('name')),
      sortBy(prop('updated')),
      reverse,
    ))
    .flatMap(data => writeFile(cacheFile, JSON.stringify(data), 'utf8').map(() => data))

const t = 30 * 60 * 1000

readFile(cacheFile, 'utf8')
  .merge(Observable.timer(t, t).flatMap(getRepos))
  .do(x => console.log(`${x.length} repos in cache`))
  .subscribe(x => {
    cache = x
  }, console.error)

export default () => cache
