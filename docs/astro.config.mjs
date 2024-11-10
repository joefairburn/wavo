// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import starlightThemeRapide from 'starlight-theme-rapide'
import tailwind from '@astrojs/tailwind';
// https://astro.build/config
export default defineConfig({
	integrations: [
		react({ experimentalReactChildren: true }),
		tailwind({
			// Disable the default base styles:
			applyBaseStyles: true,
		}),
		starlight({
			plugins: [starlightThemeRapide()],
			title: 'wavo',
			description: 'A small library for drawing waveforms in React',
			customCss: [
				'./src/styles.css',
			],
	
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
	vite: {
		resolve: {
			alias: {
				'@docs': '/src'
			}
		}
	}
});
