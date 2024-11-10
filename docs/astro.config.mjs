// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'wavo',
			description: 'A small library for drawing waveforms in React',
			social: {
				github: 'https://github.com/joefairburn/wavo',
			},
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'English',
					lang: 'en'
				}
			},
			sidebar: [
				{	
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', link: '/' },
						{ label: 'Installation', link: '/guides/installation' },
						{ label: 'Quick Start', link: '/guides/quickstart' },
					],
				},
				{
					label: 'Examples',
					items: [
						{ label: 'Container', link: '/examples/container' },
					],
				},
			],
		}),
	],
});
