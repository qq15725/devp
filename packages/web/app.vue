<script lang="ts" setup>

</script>

<template>
  <div class="hidden flex-col md:flex">
    <div class="border-b">
      <div class="flex h-16 items-center px-4">
        <MainNav class="mx-6" />
        <div class="ml-auto flex items-center space-x-4">
          <div>
            <Input
              type="search"
              placeholder="Search..."
              class="md:w-[100px] lg:w-[300px]"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="flex-1 space-y-4 p-8 pt-6" />
  </div>
</template>
