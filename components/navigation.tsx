'use client';
import Link from 'next/link';
import {useState} from 'react';
import {Menu,X} from 'lucide-react';
import {Logo} from '@/components/logo';
export function Navigation(){const[open,setOpen]=useState(false);const links=[['Home','/'],['Products','/products'],['About & Contact','/about-contact']];return <header className="site-nav"><div className="nav-inner"><Logo/><button className="menu-toggle" aria-label={open?'Close navigation':'Open navigation'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button><nav className={open?'nav-links is-open':'nav-links'} aria-label="Main navigation">{links.map(([name,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{name}</Link>)}<Link className="button nav-cta" href="/about-contact#quote" onClick={()=>setOpen(false)}>Request a Quote <span>↗</span></Link></nav></div></header>}
