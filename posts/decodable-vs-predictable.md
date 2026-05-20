---
title: "Decodable ≠ Predictable"
summary: "Another reason to choose JEPA?"
tags:
  - research
  - self-supervised-learning
publishedAt: 2026-05-20
---

*Epistemic status: first-principles reasoning. I haven't tested any of this.*

## The problem

You want a predictor with two constraints. It's trained single-step on real data, but deployed as a rollout — each prediction feeding the next.

## The naive plan

The obvious approach is to pretrain an autoencoder, freeze the encoder, and train a separate predictor on the frozen latents.

## The underdetermined representation

The issue with this approach is that autoencoder-trained encoders are **under-determined**.

Because the decoder is non-linear, many slightly-different latents can reconstruct to similar pixels. The encoder is only pressured to be *decodable*, not *exact* — for any given input, multiple latents satisfy the loss.

This is fine when the latent serves as a decoder input; the non-linearity cleans up the imprecision. It's a problem when the same latent has to act as a prediction target. The predictor needs a specific value, but gets one of many — whichever the encoder happened to settle on — so the mapping it learns is fuzzy.

## What might help

Bottleneck regularizers — L2 norm, KL-to-prior, variance regs — can shrink the equivalence class of valid latents, but they can't collapse it. As long as a non-linear decoder is in the loss, some slack will get absorbed downstream.

The more direct fix is to train the encoder against an objective that itself demands precision in its output. Latent-to-latent prediction can do this, with stop-grad or EMA on the target side to prevent collapse. Reconstruction can't — the decoder is always a non-linear consumer.

Whether any of this actually helps in practice is an experiment, not an argument.
