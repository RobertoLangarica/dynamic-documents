<template>
  <div>
    <router-view />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component({
  components: { }
})
export default class InternalLayout extends Vue {
}
</script>
