<script lang="ts">
    import axios from 'axios';
    import { onMount } from 'svelte';
    import { session } from '$app/stores';
    import { goto } from '$app/navigation';
    import trpcClient from '$lib/trpcClient';
    import AutoComplete from 'simple-svelte-autocomplete';

    let image;
    let showImage;
    let files: FileList | undefined;

    let fileUploadUrl: string | undefined;

    let selectedTags;
    let selectedTagsValues;
    let allTagsByName: string[];
    let acquiring = false;
    let uploadedImage;
    let uploading = false;
    let emoteName = '';

    let error: string | undefined;

    $: if (files && files[0]) {
        if (!showImage) {
            showImage = true;
            const file = files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                // noinspection TypeScriptValidateJSTypes
                image.setAttribute('src', reader.result);
            });
            reader.readAsDataURL(file);
            acquireFileUploadUrl();
        }
    } else {
        fileUploadUrl = undefined;
        showImage = false;
    }

    async function acquireFileUploadUrl() {
        if (acquiring || fileUploadUrl) return;

        acquiring = true;
        // noinspection TypeScriptUnresolvedVariable
        fileUploadUrl = (await axios.get('/api/upload')).data.uploadEndpoint;
        acquiring = false;
    }

    async function uploadFile() {
        const form = new FormData();
        form.append('file', files[0]);

        uploading = true;
        try {
            const res = await axios.post(fileUploadUrl, form);
            uploadedImage = res.data.result.id;
        } catch (e) {
            error = e.message;
        }
        uploading = false;
    }

    async function uploadEmote() {
        uploading = true;
        const res = await trpcClient().mutation('emotes.create', {
            id: uploadedImage,
            name: emoteName,
            tags: selectedTagsValues
        });
        await goto(`/emote/${res.id}`, true);
    }

    function handleCreate(newTag: string) {
        allTagsByName.unshift(newTag);
        allTagsByName = allTagsByName;
        return newTag;
    }

    onMount(async () => {
        allTagsByName = await trpcClient().query('tags.all');
        console.log(allTagsByName);
    });
</script>

{#if ($session.user && $session.user.role === 'ADMIN') || $session.user.role === 'SUPPORTER'}
    <section class="section">
        <div class="box">
            <h1 class="title">Upload An Emote</h1>
            {#if error}
                <div class="notification is-danger">
                    <button class="delete" on:click={() => (error = undefined)} />
                    {error}
                </div>
            {/if}
            {#if !uploadedImage && !uploading}
                <hr />
                <form action="#" method="post" enctype="multipart/form-data" on:submit|preventDefault={uploadFile}>
                    <div class="field">
                        <label class="label" for="mod-upload">Upload</label>
                        <div class="file has-name">
                            <label class="file-label">
                                <input class="file-input" type="file" accept="image/png" bind:files required />
                                <span class="file-cta">
                                    <span class="file-icon has-text-primary">
                                        <i class="fas fa-upload" />
                                    </span>
                                    <span class="file-label"> Choose a file… </span>
                                </span>
                                <span class="file-name">
                                    {files && files.length !== 0 ? files[0].name : 'No File Selected'}
                                </span>
                            </label>
                        </div>
                    </div>

                    <hr />

                    <button class="button">Upload</button>
                </form>
            {/if}
            {#if uploading}
                <hr />
                <progress class="progress is-large is-info" max="100">60%</progress>
            {/if}

            {#if showImage}
                <hr />
                <figure class="image is-128x128">
                    <img bind:this={image} src="" alt="Preview" />
                </figure>
            {/if}

            <hr />

            {#if !uploading && uploadedImage}
                <form id="mod-upload" action="#" on:submit|preventDefault={uploadEmote}>
                    <div class="field">
                        <label class="label" for="mod-upload">Name</label>
                        <div class="control">
                            <input class="input" type="text" placeholder="Emote Name" required bind:value={emoteName} />
                        </div>
                    </div>

                    <label class="label" for="mod-upload">Tags</label>
                    <AutoComplete
                        multiple={true}
                        createText={'Create a new tag...'}
                        onCreate={handleCreate}
                        create={true}
                        items={allTagsByName}
                        bind:value={selectedTagsValues}
                        bind:selectedItem={selectedTags}
                    />

                    <hr />

                    <button class="button">Submit</button>
                </form>
            {/if}
        </div>
    </section>
{:else}
    <p>Invalid Permissions</p>
{/if}
