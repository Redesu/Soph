import fetch from 'node-fetch'

import { roundToClosestMultipleOf } from '../utils/math.js';

import servers from './serverlist.json' assert { type: 'json' }

const requestImage = async (
	prompt = "",
	negativePrompt = "", 
	seed = -1, 
	initImage = null, 
	denoising = 0.75, 
	subseed = -1, 
	subseedStrength = 0.0, 
	steps = 30, 
	cfg = 11,
	width = 512,
	height = 512,
	sampler = `DPM++ 2M`,
	highresFix = false,
	hrScale = 2,
	latentSpace = false,
	clipSkip = 2
) => {
	const isImageToImage = initImage !== null

	// width and height must be multiples of 64
	const sanitizedWidth = roundToClosestMultipleOf(width, 64)
	const sanitizedHeight = roundToClosestMultipleOf(height, 64)

	const payload = {
		"init_images": [
			initImage
		],
		"resize_mode": 1,
		"enable_hr": highresFix,
		"denoising_strength": denoising,
		"hr_scale": hrScale,
		"prompt": prompt,
		"seed": seed,
		"subseed": subseed,
		"subseed_strength": subseedStrength,
		"seed_resize_from_h": -1,
		"seed_resize_from_w": -1,
		"batch_size": 1,
		"n_iter": 1,
		"steps": steps,
		"cfg_scale": cfg,
		"width": sanitizedWidth,
		"height": sanitizedHeight,
		"restore_faces": false,
		"tiling": false,
		"negative_prompt": negativePrompt,
		"eta": 0,
		"s_churn": 0,
		"s_tmax": 0,
		"s_tmin": 0,
		"s_noise": 1,
		"sampler_index": sampler,
		"override_settings": {
			"enable_pnginfo": true,
			"use_scale_latent_for_hires_fix": latentSpace,
			"CLIP_stop_at_last_layers": clipSkip
		}
	}

	const buff = Buffer.from(servers[0].credentials, 'utf-8')
	const base64Credentials = buff.toString('base64')

	const mode = `${isImageToImage ? `img` : `txt`}2img`
	const apiEndpoint = `${servers[0].address}/sdapi/v1/${mode}`
	const request = fetch(apiEndpoint, {
		method: 'post',
		body: JSON.stringify(payload),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Basic ${base64Credentials}`
		}
	})
	return request
}

export default requestImage