<template>
  <div>
    <h1>Documentos dinámicos</h1>
    <ul>
      <li>
        <router-link :to="{ name: 'login' }">
          Login
        </router-link>
      </li>
      <li><a href="/documents"><strong>Testing de documento</strong></a></li>
      <li><a href="http://localhost:3000/docs" target="_blank">API</a></li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Todo, Meta } from 'components/models'
import ExampleComponent from 'components/ClassComponent.vue'
import { Vue, Component } from 'vue-property-decorator'

@Component({
  components: { ExampleComponent }
})
export default class PageIndex extends Vue {
  todos: Todo[] = [
    {
      id: 1,
      content: 'ct1'
    },
    {
      id: 2,
      content: 'ct2'
    },
    {
      id: 3,
      content: 'ct3'
    },
    {
      id: 4,
      content: 'ct4'
    },
    {
      id: 5,
      content: 'ct5'
    }
  ];

  meta: Meta = {
    totalCount: 1200
  };
}
</script>
